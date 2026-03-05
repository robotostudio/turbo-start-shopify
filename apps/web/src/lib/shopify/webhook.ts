/**
 * Shopify webhook verification using HMAC-SHA256.
 *
 * Shopify signs each webhook request with a base64-encoded HMAC of the raw
 * request body using the webhook secret. We verify the signature before
 * processing any payload.
 *
 * @see https://shopify.dev/docs/apps/build/webhooks/secure/https-webhooks#verify-the-webhook
 */

import { env } from "@workspace/env/server";

/**
 * Verifies a Shopify webhook request by comparing the HMAC signature in the
 * `x-shopify-hmac-sha256` header against a recomputed HMAC of the raw body.
 *
 * @param request - The incoming Next.js Request object
 * @returns `{ ok: true; rawBody: string }` on success, or `{ ok: false }` on failure
 */
export async function verifyShopifyWebhook(
  request: Request
): Promise<{ ok: true; rawBody: string } | { ok: false }> {
  const hmacHeader = request.headers.get("x-shopify-hmac-sha256");

  if (!hmacHeader) {
    return { ok: false };
  }

  const rawBody = await request.text();

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.SHOPIFY_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(rawBody)
  );

  const computedHmac = btoa(String.fromCharCode(...new Uint8Array(signature)));

  // Use a timing-safe comparison to prevent timing attacks
  if (!timingSafeEqual(computedHmac, hmacHeader)) {
    return { ok: false };
  }

  return { ok: true, rawBody };
}

/**
 * Compares two strings in constant time to prevent timing attacks.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);

  let result = 0;
  for (let i = 0; i < aBytes.length; i++) {
    result |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }

  return result === 0;
}
