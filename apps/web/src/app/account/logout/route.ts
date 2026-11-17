import { type NextRequest, NextResponse } from "next/server";

import { clearCartId } from "@/lib/cart/server";
import { buildLogoutUrl } from "@/lib/customer-account/oauth";
import {
  clearSessionCookie,
  readStoredSession,
} from "@/lib/customer-account/server";

/**
 * POST alone does not stop another site from auto-submitting a form here, and
 * this handler clears cookies whether or not the request carried them. So the
 * request must come from this origin: Fetch Metadata where the browser sends
 * it, otherwise the `Origin` header. A request with neither is not a browser
 * form post from another site and is let through.
 */
function isSameOrigin(request: NextRequest): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite) return fetchSite === "same-origin" || fetchSite === "none";
  const origin = request.headers.get("origin");
  return !origin || origin === request.nextUrl.origin;
}

/**
 * Signs out here and at Shopify. The cart cookie goes too: the cart carries
 * the customer's identity, and on a shared device the next person's checkout
 * would otherwise open as them.
 *
 * The stored session is read regardless of expiry: a tab left open past the
 * access token's lifetime still needs its `idToken` to end Shopify's hosted
 * session, or the next Account visit on that device silently signs the same
 * customer back in.
 */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return new NextResponse(null, { status: 403 });
  }

  const session = await readStoredSession();
  await clearSessionCookie();
  await clearCartId();

  const target = session
    ? await buildLogoutUrl(session.idToken).catch(() => "/")
    : "/";
  // 303 turns the POST into a GET at the destination.
  return NextResponse.redirect(new URL(target, request.url), 303);
}
