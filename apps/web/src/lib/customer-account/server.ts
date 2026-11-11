import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { getCustomerAccountConfig } from "./oauth";
import {
  type CustomerSession,
  cookieOptions,
  isExpired,
  loginPath,
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
