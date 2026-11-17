import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { randomToken } from "@/lib/customer-account/crypto";
import {
  buildAuthorizationUrl,
  getCustomerAccountConfig,
} from "@/lib/customer-account/oauth";
import { getSession } from "@/lib/customer-account/server";
import {
  AUTH_FLOW_COOKIE,
  AUTH_FLOW_MAX_AGE,
  cookieOptions,
  safeReturnTo,
  writeAuthFlow,
} from "@/lib/customer-account/session";

/** Starts sign-in: stores PKCE state, then hands off to Shopify's login page. */
export async function GET(request: NextRequest) {
  const config = getCustomerAccountConfig();
  if (!config) return new NextResponse("Not found", { status: 404 });

  const returnTo = safeReturnTo(request.nextUrl.searchParams.get("returnTo"));
  if (await getSession()) {
    return NextResponse.redirect(new URL(returnTo, request.url));
  }

  const flow = {
    state: randomToken(),
    verifier: randomToken(48),
    nonce: randomToken(),
    returnTo,
  };
  const cookieStore = await cookies();
  cookieStore.set(AUTH_FLOW_COOKIE, writeAuthFlow(flow, config.sessionSecret), {
    ...cookieOptions,
    maxAge: AUTH_FLOW_MAX_AGE,
  });

  return NextResponse.redirect(await buildAuthorizationUrl(config, flow));
}
