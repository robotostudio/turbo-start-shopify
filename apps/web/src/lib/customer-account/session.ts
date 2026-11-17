import { z } from "zod";

import { seal, unseal } from "./crypto";

/**
 * Customer session shape and the pure rules around it. Cookie I/O lives in
 * `server.ts` (pages, actions, route handlers) and `proxy.ts` (refresh), both
 * of which go through `readSession` / `writeSession` here.
 *
 * See docs/adr/0001-customer-session-in-encrypted-cookie.md.
 */

export const SESSION_COOKIE = "customer-session";
/** Short-lived cookie carrying PKCE state between sign-in and the callback. */
export const AUTH_FLOW_COOKIE = "customer-auth-flow";

export const AUTH_FLOW_MAX_AGE = 60 * 10;
/** Shopify refresh tokens outlive this; the cookie is re-set on every refresh. */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;
/** Refresh this long before the access token actually expires. */
const REFRESH_LEEWAY_MS = 60_000;

export const DEFAULT_RETURN_TO = "/account";

/** Paths that run the OAuth flow itself and must stay reachable signed out. */
export const AUTH_ROUTES = [
  "/account/login",
  "/account/authorize",
  "/account/logout",
] as const;

const sessionSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1).optional(),
  idToken: z.string().min(1),
  /** Epoch ms at which `accessToken` stops working. */
  expiresAt: z.number(),
});

export type CustomerSession = z.infer<typeof sessionSchema>;

const authFlowSchema = z.object({
  state: z.string().min(1),
  verifier: z.string().min(1),
  nonce: z.string().min(1),
  returnTo: z.string(),
});

export type AuthFlow = z.infer<typeof authFlowSchema>;

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export function readSession(
  sealed: string | undefined,
  secret: string
): CustomerSession | null {
  if (!sealed) return null;
  const parsed = sessionSchema.safeParse(unseal(sealed, secret));
  return parsed.success ? parsed.data : null;
}

export function writeSession(session: CustomerSession, secret: string): string {
  return seal(session, secret);
}

export function readAuthFlow(
  sealed: string | undefined,
  secret: string
): AuthFlow | null {
  if (!sealed) return null;
  const parsed = authFlowSchema.safeParse(unseal(sealed, secret));
  return parsed.success ? parsed.data : null;
}

export function writeAuthFlow(flow: AuthFlow, secret: string): string {
  return seal(flow, secret);
}

export function needsRefresh(
  session: CustomerSession,
  now: number = Date.now()
): boolean {
  return session.expiresAt - now < REFRESH_LEEWAY_MS;
}

export function isExpired(
  session: CustomerSession,
  now: number = Date.now()
): boolean {
  return session.expiresAt <= now;
}

/**
 * Where to land after sign-in. Only same-origin paths are accepted, so the
 * `returnTo` query parameter cannot be turned into an open redirect.
 */
export function safeReturnTo(value: string | null | undefined): string {
  if (!value?.startsWith("/")) return DEFAULT_RETURN_TO;
  // Judge the value as the redirect will parse it, not as the raw string: the
  // URL parser strips tabs and newlines first, so `/\t/evil.com` would pass a
  // `startsWith("//")` check and still resolve to `https://evil.com/`.
  let url: URL;
  try {
    url = new URL(value, RETURN_TO_BASE);
  } catch {
    return DEFAULT_RETURN_TO;
  }
  if (url.origin !== RETURN_TO_BASE) return DEFAULT_RETURN_TO;
  if (AUTH_ROUTES.some((route) => url.pathname.startsWith(route))) {
    return DEFAULT_RETURN_TO;
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

/** Placeholder origin `safeReturnTo` resolves against; never requested. */
const RETURN_TO_BASE = "https://return-to.invalid";

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function isAccountRoute(pathname: string): boolean {
  return pathname === "/account" || pathname.startsWith("/account/");
}

/** Sign-in URL that returns the customer to `returnTo` afterwards. */
export function loginPath(returnTo: string): string {
  return `/account/login?returnTo=${encodeURIComponent(safeReturnTo(returnTo))}`;
}
