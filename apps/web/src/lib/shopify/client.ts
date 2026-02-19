import "server-only";

import { createStorefrontApiClient } from "@shopify/storefront-api-client";
import { env } from "@workspace/env/server";
import { Logger } from "@workspace/logger";

const logger = new Logger("ShopifyClient");

export const storefront = createStorefrontApiClient({
  storeDomain: `https://${env.SHOPIFY_STORE_DOMAIN}`,
  apiVersion: env.SHOPIFY_API_VERSION,
  publicAccessToken: env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
});

/** Typed Storefront API request. Returns discriminated union. */
export async function storefrontQuery<T>(
  query: string,
  options?: { variables?: Record<string, unknown> }
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const { data, errors } = await storefront.request<T>(query, {
      variables: options?.variables,
    });

    if (errors) {
      const message = errors.message ?? "Unknown Storefront API error";
      logger.error(`Storefront API error: ${message}`);
      return { ok: false, error: message };
    }

    if (!data) {
      return { ok: false, error: "No data returned from Storefront API" };
    }

    return { ok: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    // @shopify/storefront-api-client attaches graphQLErrors to thrown errors
    const gqlErrors = (error as { graphQLErrors?: unknown[] }).graphQLErrors;
    if (gqlErrors) {
      logger.error(
        `Storefront API GraphQL errors: ${JSON.stringify(gqlErrors)}`
      );
    }
    logger.error(`Storefront API request failed: ${message}`);
    return { ok: false, error: message };
  }
}
