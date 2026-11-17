import { type NextRequest, NextResponse } from "next/server";

import {
  getCustomerAccountConfig,
  refreshSession,
} from "@/lib/customer-account/oauth";
import {
  cookieOptions,
  isAccountRoute,
  isAuthRoute,
  loginPath,
  needsRefresh,
  readSession,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  writeSession,
} from "@/lib/customer-account/session";
import { normalizeMarkdownPath, prefersMarkdown } from "@/lib/markdown/path";

/**
 * `/account/*` gate. A cheap first layer: no session cookie means a redirect
 * to sign-in before any page renders. It also refreshes an access token that
 * is about to expire, because setting a cookie is impossible from the server
 * components that later read it. The pages still check the session
 * themselves (`requireSession`), so a forged cookie gets no further than here.
 */
async function handleAccountRequest(
  request: NextRequest
): Promise<NextResponse> {
  const config = getCustomerAccountConfig();
  const { pathname, search } = request.nextUrl;
  if (!config || isAuthRoute(pathname)) return NextResponse.next();

  const isNavigation = request.method === "GET" || request.method === "HEAD";
  const signIn = () =>
    NextResponse.redirect(
      new URL(loginPath(`${pathname}${search}`), request.url)
    );

  const session = readSession(
    request.cookies.get(SESSION_COOKIE)?.value,
    config.sessionSecret
  );
  // Server actions (POST) answer for themselves rather than being redirected.
  if (!session) return isNavigation ? signIn() : NextResponse.next();
  if (!needsRefresh(session)) return NextResponse.next();

  const refreshed = await refreshSession(config, session);
  if (!refreshed.ok) {
    const response = isNavigation ? signIn() : NextResponse.next();
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  const sealed = writeSession(refreshed.session, config.sessionSecret);
  // Set on the request too, so this same render reads the new token.
  request.cookies.set(SESSION_COOKIE, sealed);
  const response = NextResponse.next({
    request: { headers: request.headers },
  });
  response.cookies.set(SESSION_COOKIE, sealed, {
    ...cookieOptions,
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}

/**
 * Content negotiation for AI agents. A request that either ends in `.md` or
 * prefers `Accept: text/markdown` is rewritten to the `/api/markdown` route,
 * which serves a Markdown representation of the same content a browser would
 * get as HTML. Everything else passes straight through unchanged.
 *
 * `/account/*` is handled first and never negotiated: it is private, per
 * customer, and has no Markdown representation.
 *
 * Next.js 16's `proxy` convention (the former `middleware`).
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  if (isAccountRoute(request.nextUrl.pathname)) {
    return handleAccountRequest(request);
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const hasMdSuffix = pathname.endsWith(".md");
  const wantsMarkdown =
    hasMdSuffix || prefersMarkdown(request.headers.get("accept") ?? "");

  if (!wantsMarkdown) return NextResponse.next();

  const rawPath = hasMdSuffix ? pathname.slice(0, -3) : pathname;

  // Header-only negotiation must not hijack asset files (e.g. a `.png` fetched
  // with a broad `Accept`). The explicit `.md` suffix has no such ambiguity.
  const lastSegment = rawPath.split("/").pop() ?? "";
  if (!hasMdSuffix && lastSegment.includes(".")) {
    return NextResponse.next();
  }

  const contentPath = normalizeMarkdownPath(rawPath);

  // A rewrite's query params aren't reliably readable downstream, but request
  // headers are — so forward the path via both.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-markdown-path", contentPath);

  const url = request.nextUrl.clone();
  url.pathname = "/api/markdown";
  url.search = "";
  url.searchParams.set("path", contentPath);
  return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/((?!api/|_next/|favicon.ico|robots.txt|sitemap.xml|llms\\.txt|opengraph.png).*)",
  ],
};
