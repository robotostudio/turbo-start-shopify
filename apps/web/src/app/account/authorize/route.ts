import { Logger } from "@workspace/logger";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { linkCartToCustomer } from "@/lib/cart/buyer-identity";
import {
  exchangeCode,
  getCustomerAccountConfig,
} from "@/lib/customer-account/oauth";
import { setSessionCookie } from "@/lib/customer-account/server";
import { AUTH_FLOW_COOKIE, readAuthFlow } from "@/lib/customer-account/session";

const logger = new Logger("CustomerAccountAuthorize");

function signInFailed(reason: string) {
  logger.error(`Sign-in failed: ${reason}`);
  return new NextResponse(
    '<!doctype html><meta charset="utf-8"><title>Sign-in failed</title><p>Sign-in did not complete. <a href="/account/login">Try again</a> or <a href="/">return to the shop</a>.</p>',
    { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

/** OAuth callback: verify `state`, exchange the code, start the session. */
export async function GET(request: NextRequest) {
  const config = getCustomerAccountConfig();
  if (!config) return new NextResponse("Not found", { status: 404 });

  const cookieStore = await cookies();
  const flow = readAuthFlow(
    cookieStore.get(AUTH_FLOW_COOKIE)?.value,
    config.sessionSecret
  );
  cookieStore.delete(AUTH_FLOW_COOKIE);

  const params = request.nextUrl.searchParams;
  const error = params.get("error");
  if (error) return signInFailed(`Shopify returned ${error}`);
  if (!flow) return signInFailed("missing or expired auth flow cookie");
  if (params.get("state") !== flow.state) {
    return signInFailed("state mismatch");
  }
  const code = params.get("code");
  if (!code) return signInFailed("no authorization code");

  const result = await exchangeCode(config, code, flow);
  if (!result.ok) return signInFailed(result.error);

  await setSessionCookie(result.session, config.sessionSecret);
  await linkCartToCustomer(result.session.accessToken);

  return NextResponse.redirect(new URL(flow.returnTo, request.url));
}
