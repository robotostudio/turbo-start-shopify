"use server";

import { cookies } from "next/headers";
import { Logger } from "@workspace/logger";

import { storefrontQuery } from "@/lib/shopify/client";
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
} from "@/lib/shopify/mutations";
import { VARIANT_INVENTORY_QUERY } from "@/lib/shopify/queries";
import type { Cart, CartLineInput } from "@/lib/shopify/types";

const logger = new Logger("CartActions");

const CART_COOKIE = "shopify-cart-id";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

type CartResult = { ok: true; cart: Cart } | { ok: false; error: string };

async function getCartId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_COOKIE)?.value ?? null;
}

async function setCartId(cartId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE, cartId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
  });
}

export async function createCart(lines: CartLineInput[]): Promise<CartResult> {
  const result = await storefrontQuery<{
    cartCreate: { cart: Cart };
  }>(CART_CREATE_MUTATION, { variables: { lines } });

  if (!result.ok) {
    logger.error(`Failed to create cart: ${result.error}`);
    return { ok: false, error: result.error };
  }

  const cart = result.data.cartCreate.cart;
  await setCartId(cart.id);
  return { ok: true, cart };
}

export async function addToCart(lines: CartLineInput[]): Promise<CartResult> {
  const cartId = await getCartId();

  if (!cartId) {
    return createCart(lines);
  }

  const result = await storefrontQuery<{
    cartLinesAdd: { cart: Cart };
  }>(CART_LINES_ADD_MUTATION, { variables: { cartId, lines } });

  if (!result.ok) {
    logger.error(`Failed to add to cart: ${result.error}`);
    return { ok: false, error: result.error };
  }

  return { ok: true, cart: result.data.cartLinesAdd.cart };
}

export async function updateCartLine(
  lineId: string,
  quantity: number
): Promise<CartResult> {
  const cartId = await getCartId();

  if (!cartId) {
    return { ok: false, error: "No cart found" };
  }

  const result = await storefrontQuery<{
    cartLinesUpdate: { cart: Cart };
  }>(CART_LINES_UPDATE_MUTATION, {
    variables: { cartId, lines: [{ id: lineId, quantity }] },
  });

  if (!result.ok) {
    logger.error(`Failed to update cart line: ${result.error}`);
    return { ok: false, error: result.error };
  }

  return { ok: true, cart: result.data.cartLinesUpdate.cart };
}

export async function removeCartLine(lineId: string): Promise<CartResult> {
  const cartId = await getCartId();

  if (!cartId) {
    return { ok: false, error: "No cart found" };
  }

  const result = await storefrontQuery<{
    cartLinesRemove: { cart: Cart };
  }>(CART_LINES_REMOVE_MUTATION, {
    variables: { cartId, lineIds: [lineId] },
  });

  if (!result.ok) {
    logger.error(`Failed to remove cart line: ${result.error}`);
    return { ok: false, error: result.error };
  }

  return { ok: true, cart: result.data.cartLinesRemove.cart };
}

type InventoryResult =
  | { ok: true; availableForSale: boolean; quantityAvailable: number | null }
  | { ok: false; error: string };

export async function checkVariantInventory(
  variantId: string,
): Promise<InventoryResult> {
  const result = await storefrontQuery<{
    node: {
      id: string;
      availableForSale: boolean;
      quantityAvailable: number | null;
    } | null;
  }>(VARIANT_INVENTORY_QUERY, { variables: { id: variantId } });

  if (!result.ok) {
    logger.error(`Failed to check inventory: ${result.error}`);
    return { ok: false, error: result.error };
  }

  const node = result.data.node;
  if (!node) {
    return { ok: false, error: "Variant not found" };
  }

  return {
    ok: true,
    availableForSale: node.availableForSale,
    quantityAvailable: node.quantityAvailable,
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
    return null;
  }

  return result.data.cart;
}
