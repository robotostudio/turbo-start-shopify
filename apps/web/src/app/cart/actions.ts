"use server";

import { Logger } from "@workspace/logger";
import { z } from "zod";

import {
  classifyTransportError,
  classifyUserErrors,
  detectSilentClamps,
  type ExpectedTotal,
  mapShopifyWarning,
  type RequestedLine,
  requestedFromInputs,
} from "@/lib/cart/classify";
import { normalizeCart } from "@/lib/cart/engine";
import {
  clearCartId,
  getCartId,
  invalidateCartCache,
  setCartId,
} from "@/lib/cart/server";
import type { CartActionResult, CartErrorCode } from "@/lib/cart/types";
import { getSession } from "@/lib/customer-account/server";
import {
  type StorefrontFailureKind,
  storefrontQuery,
} from "@/lib/shopify/client";
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
} from "@/lib/shopify/mutations";
import { PRODUCT_QUERY } from "@/lib/shopify/queries";
import type {
  Cart,
  CartLineInput,
  CartMutationPayload,
  ProductQueryResponse,
  ShopifyProductOption,
  ShopifyVariant,
} from "@/lib/shopify/types";

const logger = new Logger("CartActions");

const quantitySchema = z.number().int().min(1).max(99);
const idSchema = z.string().min(1);
const linesSchema = z
  .array(z.object({ merchandiseId: idSchema, quantity: quantitySchema }))
  .min(1);
const updateLineSchema = z.object({
  lineId: idSchema,
  quantity: quantitySchema,
  merchandiseId: idSchema.optional(),
});

function failure(code: CartErrorCode, message: string): CartActionResult {
  return { ok: false, error: { code, message } };
}

function invalidInput(error: z.ZodError): CartActionResult {
  return failure("INVALID_INPUT", error.issues[0]?.message ?? "Invalid input");
}

async function settleTransportFailure(
  label: string,
  error: string,
  kind: StorefrontFailureKind
): Promise<CartActionResult> {
  const classified = classifyTransportError(error, kind);
  if (classified.code === "CART_NOT_FOUND") {
    await clearCartId();
  }
  logger.error(`${label} failed: ${classified.message}`);
  return { ok: false, error: classified };
}

async function settleMutation(
  label: string,
  payload: CartMutationPayload | undefined,
  requested: RequestedLine[]
): Promise<CartActionResult> {
  if (!payload) {
    return failure("UNKNOWN", `${label} returned an empty response`);
  }
  const userFailure = classifyUserErrors(payload.userErrors ?? []);
  if (userFailure) {
    if (
      userFailure.code === "CART_NOT_FOUND" ||
      userFailure.code === "CART_COMPLETED"
    ) {
      await clearCartId();
    }
    logger.error(`${label} user error: ${userFailure.message}`);
    return { ok: false, error: userFailure };
  }
  if (!payload.cart) {
    return failure("UNKNOWN", `${label} returned no cart`);
  }
  const cart = normalizeCart(payload.cart);
  const warnings = (payload.warnings ?? []).map(mapShopifyWarning);
  warnings.push(...detectSilentClamps(cart, requested, warnings));
  invalidateCartCache();
  return { ok: true, cart, warnings };
}

export async function createCart(
  lines: CartLineInput[],
  expectedTotals?: ExpectedTotal[]
): Promise<CartActionResult> {
  const parsed = linesSchema.safeParse(lines);
  if (!parsed.success) return invalidInput(parsed.error);

  // A cart created while signed in starts out linked to the customer.
  const session = await getSession();
  const result = await storefrontQuery<{ cartCreate: CartMutationPayload }>(
    CART_CREATE_MUTATION,
    {
      variables: {
        lines: parsed.data,
        buyerIdentity: session
          ? { customerAccessToken: session.accessToken }
          : null,
      },
    }
  );
  if (!result.ok) {
    return settleTransportFailure("createCart", result.error, result.kind);
  }

  const settled = await settleMutation(
    "createCart",
    result.data.cartCreate,
    requestedFromInputs(parsed.data, expectedTotals)
  );
  if (settled.ok) {
    await setCartId(settled.cart.id);
  }
  return settled;
}

export async function addToCart(
  lines: CartLineInput[],
  expectedTotals?: ExpectedTotal[]
): Promise<CartActionResult> {
  const parsed = linesSchema.safeParse(lines);
  if (!parsed.success) return invalidInput(parsed.error);

  const cartId = await getCartId();
  if (!cartId) {
    return createCart(parsed.data, expectedTotals);
  }

  const result = await storefrontQuery<{ cartLinesAdd: CartMutationPayload }>(
    CART_LINES_ADD_MUTATION,
    { variables: { cartId, lines: parsed.data } }
  );
  if (!result.ok) {
    return settleTransportFailure("addToCart", result.error, result.kind);
  }

  return settleMutation(
    "addToCart",
    result.data.cartLinesAdd,
    requestedFromInputs(parsed.data, expectedTotals)
  );
}

export async function updateCartLine(
  lineId: string,
  quantity: number,
  merchandiseId?: string
): Promise<CartActionResult> {
  const parsed = updateLineSchema.safeParse({
    lineId,
    quantity,
    merchandiseId,
  });
  if (!parsed.success) return invalidInput(parsed.error);

  const cartId = await getCartId();
  if (!cartId) {
    return failure("CART_NOT_FOUND", "No cart found");
  }

  const line = parsed.data.merchandiseId
    ? {
        id: parsed.data.lineId,
        quantity: parsed.data.quantity,
        merchandiseId: parsed.data.merchandiseId,
      }
    : { id: parsed.data.lineId, quantity: parsed.data.quantity };

  const result = await storefrontQuery<{
    cartLinesUpdate: CartMutationPayload;
  }>(CART_LINES_UPDATE_MUTATION, {
    variables: { cartId, lines: [line] },
  });
  if (!result.ok) {
    return settleTransportFailure("updateCartLine", result.error, result.kind);
  }

  const requested: RequestedLine[] = parsed.data.merchandiseId
    ? [
        {
          key: "merchandiseId",
          id: parsed.data.merchandiseId,
          quantity: parsed.data.quantity,
          exact: false,
        },
      ]
    : [
        {
          key: "lineId",
          id: parsed.data.lineId,
          quantity: parsed.data.quantity,
          exact: true,
        },
      ];

  return settleMutation(
    "updateCartLine",
    result.data.cartLinesUpdate,
    requested
  );
}

export async function removeCartLine(
  lineId: string
): Promise<CartActionResult> {
  const parsed = idSchema.safeParse(lineId);
  if (!parsed.success) return invalidInput(parsed.error);

  const cartId = await getCartId();
  if (!cartId) {
    return failure("CART_NOT_FOUND", "No cart found");
  }

  const result = await storefrontQuery<{
    cartLinesRemove: CartMutationPayload;
  }>(CART_LINES_REMOVE_MUTATION, {
    variables: { cartId, lineIds: [parsed.data] },
  });
  if (!result.ok) {
    return settleTransportFailure("removeCartLine", result.error, result.kind);
  }

  return settleMutation("removeCartLine", result.data.cartLinesRemove, []);
}

export type ProductOptions = {
  options: ShopifyProductOption[];
  variants: ShopifyVariant[];
};

/**
 * Fetches a product's options and variants by handle — used to build the
 * in-cart Color/Size variant selectors. Returns null on error or missing
 * product so the caller can fall back to displaying the line's own options.
 */
export async function getProductOptions(
  handle: string
): Promise<ProductOptions | null> {
  const result = await storefrontQuery<ProductQueryResponse>(PRODUCT_QUERY, {
    variables: { handle },
  });

  if (!result.ok) {
    logger.error(`Failed to fetch product options: ${result.error}`);
    return null;
  }

  const product = result.data.product;
  if (!product) {
    return null;
  }

  return {
    options: product.options,
    variants: product.variants.edges.map((edge) => edge.node),
  };
}

export async function getCart(): Promise<Cart | null> {
  const cartId = await getCartId();

  if (!cartId) {
    return null;
  }

  const result = await storefrontQuery<{ cart: Cart | null }>(CART_QUERY, {
    variables: { cartId },
  });

  if (!result.ok) {
    logger.error(`Failed to fetch cart: ${result.error}`);
    throw new Error(`getCart failed (${result.kind}): ${result.error}`);
  }

  if (!result.data.cart) {
    try {
      await clearCartId();
    } catch {
      logger.warning("Could not clear stale cart cookie outside an action");
    }
    return null;
  }

  return normalizeCart(result.data.cart);
}
