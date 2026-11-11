import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { getCustomerAccountConfig, refreshSession } from "./oauth";
import {
  type CustomerSession,
  cookieOptions,
  isExpired,
  loginPath,
  needsRefresh,
  readSession,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  writeSession,
} from "./session";

/**
 * The current customer session, or `null`. Read-only: refreshing a token
 * means setting a cookie, which a server component cannot do, so `proxy.ts`
 * refreshes before the request reaches here. An expired session that the
 * proxy could not refresh is reported as no session.
 */
export async function getSession(): Promise<CustomerSession | null> {
  const config = getCustomerAccountConfig();
  if (!config) return null;
  // Request-time only: the expiry check reads the clock, which Cache
  // Components refuses during prerender.
  await connection();
  const cookieStore = await cookies();
  const session = readSession(
    cookieStore.get(SESSION_COOKIE)?.value,
    config.sessionSecret
  );
  if (!session || isExpired(session)) return null;
  return session;
}

/**
 * Route handlers and server actions only. The session with a usable access
 * token, refreshing it here when it is about to expire — the proxy refreshes
 * only on `/account/*`, so outside it the 30-day cookie routinely outlives the
 * access token. A refresh that fails clears the cookie and reports no session.
 */
export async function getFreshSession(): Promise<CustomerSession | null> {
  const config = getCustomerAccountConfig();
  if (!config) return null;
  const cookieStore = await cookies();
  const session = readSession(
    cookieStore.get(SESSION_COOKIE)?.value,
    config.sessionSecret
  );
  if (!session) return null;
  if (!needsRefresh(session)) return session;

  const refreshed = await refreshSession(config, session);
  if (!refreshed.ok) {
    cookieStore.delete(SESSION_COOKIE);
    return null;
  }
  await setSessionCookie(refreshed.session, config.sessionSecret);
  return refreshed.session;
}

/**
 * The sealed session whether or not its access token has expired. For sign-out
 * only, which needs just the `idToken` as a hint to Shopify's end-session
 * endpoint — never use it to act as the customer.
 */
export async function readStoredSession(): Promise<CustomerSession | null> {
  const config = getCustomerAccountConfig();
  if (!config) return null;
  const cookieStore = await cookies();
  return readSession(
    cookieStore.get(SESSION_COOKIE)?.value,
    config.sessionSecret
  );
}

/** The session, or a redirect to sign-in that comes back to `returnTo`. */
export async function requireSession(
  returnTo: string
): Promise<CustomerSession> {
  const session = await getSession();
  if (!session) redirect(loginPath(returnTo));
  return session;
}

/** Route handlers and server actions only. */
export async function setSessionCookie(
  session: CustomerSession,
  secret: string
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, writeSession(session, secret), {
    ...cookieOptions,
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
