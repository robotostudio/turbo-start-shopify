import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

/**
 * Pure crypto helpers for the customer session. No Next imports, so they are
 * unit-testable and usable from `proxy.ts`, route handlers and actions alike.
 */

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;

function keyFrom(secret: string): Buffer {
  return createHash("sha256").update(secret).digest();
}

/** Encrypts and authenticates a JSON value into a cookie-safe string. */
export function seal(value: unknown, secret: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, keyFrom(secret), iv);
  const body = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  return [iv, cipher.getAuthTag(), body]
    .map((part) => part.toString("base64url"))
    .join(".");
}

/**
 * Reverses `seal`. Returns `null` for anything tampered with, sealed under a
 * different secret, or malformed: callers treat all three as "no session".
 */
export function unseal(sealed: string, secret: string): unknown {
  const [iv, tag, body] = sealed.split(".");
  if (!(iv && tag && body)) return null;
  try {
    const decipher = createDecipheriv(
      ALGORITHM,
      keyFrom(secret),
      Buffer.from(iv, "base64url")
    );
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    const plain = Buffer.concat([
      decipher.update(Buffer.from(body, "base64url")),
      decipher.final(),
    ]).toString("utf8");
    return JSON.parse(plain);
  } catch {
    return null;
  }
}

/** URL-safe random string for PKCE verifiers, `state` and `nonce`. */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** RFC 7636 S256 code challenge: unpadded base64url of SHA-256(verifier). */
export function codeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

/**
 * Reads a JWT's payload without verifying its signature. Only used on the
 * `id_token` that arrived over TLS straight from Shopify's token endpoint, to
 * compare its `nonce` with the one we sent.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> {
  const payload = token.split(".")[1];
  if (!payload) return {};
  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}
