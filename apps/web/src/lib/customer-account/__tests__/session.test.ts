import { describe, expect, it } from "vitest";

import { seal } from "../crypto";
import {
  type CustomerSession,
  isAccountRoute,
  isAuthRoute,
  isExpired,
  loginPath,
  needsRefresh,
  readAuthFlow,
  readSession,
  safeReturnTo,
  writeAuthFlow,
  writeSession,
} from "../session";

const SECRET = "a-test-secret-that-is-at-least-32-chars";
const NOW = 1_700_000_000_000;

const session: CustomerSession = {
  accessToken: "shcat_abc",
  refreshToken: "shcrt_def",
  idToken: "h.p.s",
  expiresAt: NOW + 3_600_000,
};

describe("readSession", () => {
  it("round-trips through writeSession", () => {
    expect(readSession(writeSession(session, SECRET), SECRET)).toEqual(session);
  });

  it("is null without a cookie", () => {
    expect(readSession(undefined, SECRET)).toBeNull();
  });

  it("is null when the sealed value has the wrong shape", () => {
    expect(readSession(seal({ accessToken: "x" }, SECRET), SECRET)).toBeNull();
  });
});

describe("readAuthFlow", () => {
  it("round-trips through writeAuthFlow", () => {
    const flow = {
      state: "s",
      verifier: "v",
      nonce: "n",
      returnTo: "/account",
    };
    expect(readAuthFlow(writeAuthFlow(flow, SECRET), SECRET)).toEqual(flow);
  });

  it("does not accept a session cookie as an auth flow", () => {
    expect(readAuthFlow(writeSession(session, SECRET), SECRET)).toBeNull();
  });
});

describe("token expiry", () => {
  it("refreshes within a minute of expiry", () => {
    expect(needsRefresh({ ...session, expiresAt: NOW + 30_000 }, NOW)).toBe(
      true
    );
    expect(needsRefresh({ ...session, expiresAt: NOW + 120_000 }, NOW)).toBe(
      false
    );
  });

  it("is expired only once expiresAt has passed", () => {
    expect(isExpired({ ...session, expiresAt: NOW }, NOW)).toBe(true);
    expect(isExpired({ ...session, expiresAt: NOW + 1 }, NOW)).toBe(false);
  });
});

describe("safeReturnTo", () => {
  it.each([
    ["/account/orders", "/account/orders"],
    ["/products/hat?size=m", "/products/hat?size=m"],
  ])("keeps the same-origin path %s", (input, expected) => {
    expect(safeReturnTo(input)).toBe(expected);
  });

  it.each([
    null,
    undefined,
    "",
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    // The URL parser strips these, leaving `//evil.example`.
    "/\t/evil.example",
    "/\n/evil.example",
    "/\r\n/evil.example",
    "/\t\\evil.example",
    "/account/login",
    "/account/logout",
    "/\taccount/login",
  ])("falls back to /account for %j", (input) => {
    expect(safeReturnTo(input)).toBe("/account");
  });
});

describe("route matching", () => {
  it("recognises account routes", () => {
    expect(isAccountRoute("/account")).toBe(true);
    expect(isAccountRoute("/account/orders/1")).toBe(true);
    expect(isAccountRoute("/accounting")).toBe(false);
  });

  it("recognises the OAuth routes", () => {
    expect(isAuthRoute("/account/login")).toBe(true);
    expect(isAuthRoute("/account/authorize")).toBe(true);
    expect(isAuthRoute("/account")).toBe(false);
    expect(isAuthRoute("/account/loginx")).toBe(false);
  });

  it("builds a sign-in path that returns to the page", () => {
    expect(loginPath("/account/orders?after=abc")).toBe(
      "/account/login?returnTo=%2Faccount%2Forders%3Fafter%3Dabc"
    );
  });
});
