import "server-only";

import { redirect } from "next/navigation";

import { customerAccountQuery } from "./client";
import { requireSession } from "./server";
import { loginPath } from "./session";

/**
 * Page-side loader: the second layer of protection after `proxy.ts`. No
 * session, or a session Shopify rejects, redirects to sign-in and back to
 * `returnTo`. Any other failure throws to the route's error boundary.
 */
export async function loadCustomerData<T>(
  query: string,
  returnTo: string,
  variables?: Record<string, unknown>
): Promise<T> {
  await requireSession(returnTo);
  const result = await customerAccountQuery<T>(query, { variables });
  if (result.ok) return result.data;
  if (result.kind === "unauthorized") redirect(loginPath(returnTo));
  throw new Error(`Could not load account data: ${result.error}`);
}
