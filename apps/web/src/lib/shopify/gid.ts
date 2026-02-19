import "server-only";

import { Logger } from "@workspace/logger";

import { storefrontQuery } from "./client";
import { NODES_QUERY } from "./queries";
import type { NodesResponse, ShopifyNode } from "./types";

const logger = new Logger("ShopifyGid");

/**
 * Recursively extracts all Shopify GIDs from a nested data structure.
 * Looks for string values on keys named "gid" that start with "gid://shopify/".
 */
export function extractGids(data: unknown): string[] {
  const gids = new Set<string>();

  function walk(value: unknown): void {
    if (value == null || typeof value !== "object") return;

    if (Array.isArray(value)) {
      for (const item of value) {
        walk(item);
      }
      return;
    }

    const record = value as Record<string, unknown>;
    if (
      typeof record.gid === "string" &&
      record.gid.startsWith("gid://shopify/")
    ) {
      gids.add(record.gid);
    }

    for (const val of Object.values(record)) {
      walk(val);
    }
  }

  walk(data);
  return [...gids];
}

/**
 * Batch-fetches Shopify nodes by GID using the Storefront API `nodes` query.
 * Returns a Map keyed by GID for O(1) lookups.
 *
 * Follows the hydrogen-sanity-demo pattern: Sanity stores GIDs,
 * we resolve them against Shopify for live data (pricing, availability).
 */
export async function fetchGids(
  gids: string[]
): Promise<Map<string, ShopifyNode>> {
  const byGid = new Map<string, ShopifyNode>();

  if (gids.length === 0) return byGid;

  const result = await storefrontQuery<NodesResponse>(NODES_QUERY, {
    variables: { ids: gids },
  });

  if (!result.ok) {
    logger.error(`GID batch fetch failed: ${result.error}`);
    return byGid;
  }

  for (const node of result.data.nodes) {
    if (node?.id) {
      byGid.set(node.id, node);
    }
  }

  return byGid;
}

/**
 * Extracts all Shopify GIDs from Sanity data and batch-fetches them
 * from the Storefront API. Returns a Map keyed by GID.
 *
 * Usage in RSC pages:
 * ```ts
 * const gidMap = await resolveGids(sanityPageData);
 * const product = gidMap.get(sanityProduct.store.gid);
 * ```
 */
export async function resolveGids(
  data: unknown
): Promise<Map<string, ShopifyNode>> {
  const gids = extractGids(data);
  return fetchGids(gids);
}
