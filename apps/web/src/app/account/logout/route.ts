import { type NextRequest, NextResponse } from "next/server";

import { clearCartId } from "@/lib/cart/server";
import { buildLogoutUrl } from "@/lib/customer-account/oauth";
import { clearSessionCookie, getSession } from "@/lib/customer-account/server";

/**
 * Signs out here and at Shopify. POST only, so another site cannot sign a
 * customer out with an image tag. The cart cookie goes too: the cart carries
 * the customer's identity, and on a shared device the next person's checkout
 * would otherwise open as them.
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  await clearSessionCookie();
  await clearCartId();

  const target = session
    ? await buildLogoutUrl(session.idToken).catch(() => "/")
    : "/";
  // 303 turns the POST into a GET at the destination.
  return NextResponse.redirect(new URL(target, request.url), 303);
}
