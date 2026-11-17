import { describe, expect, it } from "vitest";

import {
  codeChallenge,
  decodeJwtPayload,
  randomToken,
  seal,
  unseal,
} from "../crypto";

const SECRET = "a-test-secret-that-is-at-least-32-chars";

describe("seal / unseal", () => {
  it("round-trips a JSON value", () => {
    const value = { accessToken: "abc", expiresAt: 123 };
    expect(unseal(seal(value, SECRET), SECRET)).toEqual(value);
  });

  it("produces a different ciphertext each time", () => {
    expect(seal({ a: 1 }, SECRET)).not.toBe(seal({ a: 1 }, SECRET));
  });

  it("rejects a different secret", () => {
    const sealed = seal({ a: 1 }, SECRET);
    expect(unseal(sealed, `${SECRET}-rotated`)).toBeNull();
  });

  it("rejects a tampered body", () => {
    const [iv, tag, body = ""] = seal({ a: 1 }, SECRET).split(".");
    // Flip a decoded byte. Swapping the last base64url character is not
    // tampering: its low bits are padding the decoder discards, so a quarter
    // of the time the ciphertext came out unchanged.
    const bytes = Buffer.from(body, "base64url");
    bytes[0] = (bytes[0] ?? 0) ^ 1;
    const flipped = bytes.toString("base64url");
    expect(unseal([iv, tag, flipped].join("."), SECRET)).toBeNull();
  });

  it("rejects malformed input", () => {
    expect(unseal("", SECRET)).toBeNull();
    expect(unseal("not.a-cookie", SECRET)).toBeNull();
  });
});

describe("codeChallenge", () => {
  // Shopify rejects padded or non-URL-safe challenges with `invalid_grant`.
  it("is an unpadded base64url SHA-256 (43 chars)", () => {
    const challenge = codeChallenge(randomToken(48));
    expect(challenge).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it("is deterministic per verifier", () => {
    expect(codeChallenge("verifier-a")).toBe(codeChallenge("verifier-a"));
    expect(codeChallenge("verifier-a")).not.toBe(codeChallenge("verifier-b"));
  });
});

describe("randomToken", () => {
  it("is URL-safe and unique", () => {
    const token = randomToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(randomToken()).not.toBe(token);
  });
});

describe("decodeJwtPayload", () => {
  it("reads the payload claims", () => {
    const payload = Buffer.from(JSON.stringify({ nonce: "n1" })).toString(
      "base64url"
    );
    expect(decodeJwtPayload(`h.${payload}.s`)).toEqual({ nonce: "n1" });
  });

  it("returns an empty object for garbage", () => {
    expect(decodeJwtPayload("garbage")).toEqual({});
    expect(decodeJwtPayload("h.%%%.s")).toEqual({});
  });
});
