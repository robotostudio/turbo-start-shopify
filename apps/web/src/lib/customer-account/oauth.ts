import "server-only";

import { env } from "@workspace/env/server";
import { Logger } from "@workspace/logger";

import { getBaseUrl } from "@/utils";
import { codeChallenge, decodeJwtPayload } from "./crypto";
import type { AuthFlow, CustomerSession } from "./session";

const logger = new Logger("CustomerAccountOAuth");

/** Scopes for a headless storefront acting on a signed-in customer. */
const SCOPES = "openid email customer-account-api:full";

export type CustomerAccountConfig = {
  clientId: string;
  sessionSecret: string;
};

/**
 * Customer accounts switch on only when both variables are set, so a fork
 * that never configures them still builds and simply has no `/account`.
 */
export function getCustomerAccountConfig(): CustomerAccountConfig | null {
  const clientId = env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID;
  const sessionSecret = env.CUSTOMER_SESSION_SECRET;
  if (!(clientId && sessionSecret)) return null;
  return { clientId, sessionSecret };
}

export function isCustomerAccountEnabled(): boolean {
  return getCustomerAccountConfig() !== null;
}

/** The OAuth callback. Must match a Redirect URI in the Headless channel. */
export function redirectUri(): string {
  return `${getBaseUrl()}/account/authorize`;
}

type OpenIdConfiguration = {
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint: string;
};

type CustomerAccountApiConfiguration = {
  graphql_api: string;
};

const discoveryCache = new Map<string, Promise<unknown>>();

/**
 * Shopify's discovery documents, served from the storefront domain. Memoised
 * per process; a failed fetch is evicted so the next request retries.
 */
function discover<T>(path: string): Promise<T> {
  const cached = discoveryCache.get(path);
  if (cached) return cached as Promise<T>;

  const pending = (async () => {
    const response = await fetch(`https://${env.SHOPIFY_STORE_DOMAIN}${path}`);
    if (!response.ok) {
      throw new Error(`Discovery ${path} failed: HTTP ${response.status}`);
    }
    return (await response.json()) as T;
  })();
  discoveryCache.set(path, pending);
  pending.catch(() => discoveryCache.delete(path));
  return pending;
}

export function getOpenIdConfiguration(): Promise<OpenIdConfiguration> {
  return discover<OpenIdConfiguration>("/.well-known/openid-configuration");
}

export async function getGraphqlEndpoint(): Promise<string> {
  const config = await discover<CustomerAccountApiConfiguration>(
    "/.well-known/customer-account-api"
  );
  return config.graphql_api;
}

export async function buildAuthorizationUrl(
  config: CustomerAccountConfig,
  flow: AuthFlow
): Promise<string> {
  const { authorization_endpoint } = await getOpenIdConfiguration();
  const url = new URL(authorization_endpoint);
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri());
  url.searchParams.set("state", flow.state);
  url.searchParams.set("nonce", flow.nonce);
  url.searchParams.set("code_challenge", codeChallenge(flow.verifier));
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

type TokenResponse = {
  access_token: string;
  expires_in: number;
  id_token?: string;
  refresh_token?: string;
};

export type TokenResult =
  | { ok: true; session: CustomerSession }
  | { ok: false; error: string };

async function requestTokens(
  body: URLSearchParams,
  previousIdToken?: string
): Promise<TokenResult> {
  try {
    const { token_endpoint } = await getOpenIdConfiguration();
    const response = await fetch(token_endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // Public clients are checked against the channel's JavaScript origins.
        Origin: getBaseUrl(),
        "User-Agent": "turbo-start-shopify",
      },
      body,
    });
    if (!response.ok) {
      const text = await response.text();
      logger.error(`Token request failed: HTTP ${response.status} ${text}`);
      return { ok: false, error: `Token request failed (${response.status})` };
    }
    const tokens = (await response.json()) as TokenResponse;
    const idToken = tokens.id_token ?? previousIdToken;
    if (!idToken) {
      return { ok: false, error: "Token response carried no id_token" };
    }
    return {
      ok: true,
      session: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        idToken,
        expiresAt: Date.now() + tokens.expires_in * 1000,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Token request failed: ${message}`);
    return { ok: false, error: message };
  }
}

/** Exchanges the callback's `code` and checks the `id_token` nonce. */
export async function exchangeCode(
  config: CustomerAccountConfig,
  code: string,
  flow: AuthFlow
): Promise<TokenResult> {
  const result = await requestTokens(
    new URLSearchParams({
      grant_type: "authorization_code",
      client_id: config.clientId,
      redirect_uri: redirectUri(),
      code,
      code_verifier: flow.verifier,
    })
  );
  if (!result.ok) return result;

  const { nonce } = decodeJwtPayload(result.session.idToken);
  if (nonce !== flow.nonce) {
    return { ok: false, error: "id_token nonce mismatch" };
  }
  return result;
}

export async function refreshSession(
  config: CustomerAccountConfig,
  session: CustomerSession
): Promise<TokenResult> {
  if (!session.refreshToken) {
    return { ok: false, error: "Session has no refresh token" };
  }
  const result = await requestTokens(
    new URLSearchParams({
      grant_type: "refresh_token",
      client_id: config.clientId,
      refresh_token: session.refreshToken,
    }),
    session.idToken
  );
  if (!result.ok) return result;
  // Shopify may not rotate the refresh token; keep the old one if so.
  return {
    ok: true,
    session: {
      ...result.session,
      refreshToken: result.session.refreshToken ?? session.refreshToken,
    },
  };
}

/** Shopify's end-session URL, which signs the customer out there too. */
export async function buildLogoutUrl(idToken: string): Promise<string> {
  const { end_session_endpoint } = await getOpenIdConfiguration();
  const url = new URL(end_session_endpoint);
  url.searchParams.set("id_token_hint", idToken);
  url.searchParams.set("post_logout_redirect_uri", `${getBaseUrl()}/`);
  return url.toString();
}
