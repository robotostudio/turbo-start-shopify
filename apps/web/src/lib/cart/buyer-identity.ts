import "server-only";

import { Logger } from "@workspace/logger";

import { storefrontQuery } from "@/lib/shopify/client";
import { CART_BUYER_IDENTITY_UPDATE_MUTATION } from "@/lib/shopify/mutations";
import { getCartId, invalidateCartCache } from "./server";

const logger = new Logger("CartBuyerIdentity");

type BuyerIdentityPayload = {
  cartBuyerIdentityUpdate: {
    cart: { id: string } | null;
    userErrors: Array<{ message: string }>;
  } | null;
};

/**
 * Links the visitor's existing cart (if any) to the customer who just signed
 * in, so checkout opens signed in. Server-only, never a server action: it
 * takes a token, and an action would let any client send one. Failure is
 * logged and swallowed — sign-in must not fail because a cart link did.
 */
export async function linkCartToCustomer(
  customerAccessToken: string
): Promise<void> {
  const cartId = await getCartId();
  if (!cartId) return;

  const result = await storefrontQuery<BuyerIdentityPayload>(
    CART_BUYER_IDENTITY_UPDATE_MUTATION,
    { variables: { cartId, buyerIdentity: { customerAccessToken } } }
  );
  if (!result.ok) {
    logger.warn(`Cart link failed: ${result.error}`);
    return;
  }
  const errors = result.data.cartBuyerIdentityUpdate?.userErrors ?? [];
  if (errors.length > 0) {
    logger.warn(`Cart link failed: ${errors.map((e) => e.message).join("; ")}`);
    return;
  }
  invalidateCartCache();
}
