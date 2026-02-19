/** Shopify Admin GraphQL client and helpers. */

import "dotenv/config";
import { Logger } from "@workspace/logger";
import type { GqlResponse, PaginatedField, UserError } from "./types.js";

export const log = new Logger("seed-shopify");

const API_VERSION = "2026-01";

/** Returns the Admin GraphQL endpoint URL. Exits if env vars are missing. */
function getAdminUrl(): { url: string; token: string; domain: string } {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  if (!domain || !token) {
    log.error(
      "SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN must be set in apps/studio/.env"
    );
    process.exit(1);
  }

  return {
    url: `https://${domain}/admin/api/${API_VERSION}/graphql.json`,
    token,
    domain,
  };
}

/** Sends a GraphQL mutation/query to the Shopify Admin API. */
export async function adminQuery<T = Record<string, unknown>>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<GqlResponse<T>> {
  const { url, token } = getAdminUrl();

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  return res.json() as Promise<GqlResponse<T>>;
}

/** Logs userErrors and returns true when errors exist. */
export function hasUserErrors(
  userErrors: UserError[] | undefined,
  label: string
): boolean {
  if (!userErrors?.length) return false;
  for (const e of userErrors) {
    log.error(`${label} — ${e.field?.join(".") ?? "?"}: ${e.message}`);
  }
  return true;
}

/** Returns true when the error is a duplicate resource. */
export function isDuplicateError(userErrors: UserError[]): boolean {
  return userErrors.some(
    (e) =>
      e.message?.toLowerCase().includes("taken") ||
      e.message?.toLowerCase().includes("already") ||
      e.message?.toLowerCase().includes("unique")
  );
}

/** Fetches the first location ID for inventory adjustments. */
export async function getDefaultLocationId(): Promise<string> {
  const result = await adminQuery<{
    locations: { edges: Array<{ node: { id: string; name: string } }> };
  }>(`{
    locations(first: 1) {
      edges { node { id name } }
    }
  }`);

  const loc = result.data?.locations?.edges?.[0]?.node;
  if (!loc) throw new Error("No locations found in store.");
  log.info(`Default location: ${loc.name} (${loc.id})`);
  return loc.id;
}

/** Returns the store domain string for display. */
export function getStoreDomain(): string {
  return getAdminUrl().domain;
}

/** Fetches all nodes from a cursor-paginated Shopify query. */
export async function fetchPaginated<T>(
  query: string,
  fieldName: string
): Promise<T[]> {
  const nodes: T[] = [];
  let cursor: string | null = null;

  do {
    type Response = Record<string, PaginatedField<T>>;
    const result: GqlResponse<Response> = await adminQuery<Response>(query, {
      cursor,
    });

    const field = result.data?.[fieldName];
    if (!field) break;

    for (const { node } of field.edges) nodes.push(node);

    cursor = field.pageInfo.hasNextPage
      ? (field.edges.at(-1)?.cursor ?? null)
      : null;
  } while (cursor);

  return nodes;
}
