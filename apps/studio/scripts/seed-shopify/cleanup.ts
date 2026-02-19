/** Store cleanup — removes all products, collections, and discounts. */

import { adminQuery, fetchPaginated, hasUserErrors, log } from "./client.js";
import type { UserError } from "./types.js";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

const PRODUCTS_QUERY = `query($cursor: String) {
  products(first: 50, after: $cursor) {
    edges { cursor node { id } }
    pageInfo { hasNextPage }
  }
}`;

const COLLECTIONS_QUERY = `query($cursor: String) {
  collections(first: 50, after: $cursor) {
    edges { cursor node { id } }
    pageInfo { hasNextPage }
  }
}`;

const CODE_DISCOUNTS_QUERY = `query($cursor: String) {
  codeDiscountNodes(first: 50, after: $cursor) {
    edges { cursor node { id } }
    pageInfo { hasNextPage }
  }
}`;

const AUTO_DISCOUNTS_QUERY = `query($cursor: String) {
  automaticDiscountNodes(first: 50, after: $cursor) {
    edges { cursor node { id } }
    pageInfo { hasNextPage }
  }
}`;

// ---------------------------------------------------------------------------
// Delete helpers
// ---------------------------------------------------------------------------

interface IdNode {
  id: string;
}

async function deleteEach(
  nodes: IdNode[],
  mutation: string,
  resultKey: string
): Promise<number> {
  let count = 0;
  for (const { id } of nodes) {
    const result = await adminQuery<
      Record<string, { userErrors: UserError[] }>
    >(mutation, { id });
    const { userErrors } = result.data?.[resultKey] ?? {};
    if (hasUserErrors(userErrors, `Delete:${id}`)) continue;
    count++;
  }
  return count;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Fetches and deletes all products. */
export async function cleanAllProducts(): Promise<void> {
  log.info("Deleting all products…");
  const nodes = await fetchPaginated<IdNode>(PRODUCTS_QUERY, "products");
  const total = await deleteEach(
    nodes,
    `mutation($id: ID!) {
      productDelete(input: { id: $id }) {
        deletedProductId
        userErrors { field message }
      }
    }`,
    "productDelete"
  );
  log.info(`${total} product(s) removed`);
}

/** Fetches and deletes all collections. */
export async function cleanAllCollections(): Promise<void> {
  log.info("Deleting all collections…");
  const nodes = await fetchPaginated<IdNode>(COLLECTIONS_QUERY, "collections");
  const total = await deleteEach(
    nodes,
    `mutation($id: ID!) {
      collectionDelete(input: { id: $id }) {
        deletedCollectionId
        userErrors { field message }
      }
    }`,
    "collectionDelete"
  );
  log.info(`${total} collection(s) removed`);
}

/** Fetches and deletes all code + automatic discounts. */
export async function cleanAllDiscounts(): Promise<void> {
  log.info("Deleting all discounts…");

  const codeNodes = await fetchPaginated<IdNode>(
    CODE_DISCOUNTS_QUERY,
    "codeDiscountNodes"
  );
  const codeCount = await deleteEach(
    codeNodes,
    `mutation($id: ID!) {
      discountCodeDelete(id: $id) {
        deletedCodeDiscountId
        userErrors { field message }
      }
    }`,
    "discountCodeDelete"
  );

  const autoNodes = await fetchPaginated<IdNode>(
    AUTO_DISCOUNTS_QUERY,
    "automaticDiscountNodes"
  );
  const autoCount = await deleteEach(
    autoNodes,
    `mutation($id: ID!) {
      discountAutomaticDelete(id: $id) {
        deletedAutomaticDiscountId
        userErrors { field message }
      }
    }`,
    "discountAutomaticDelete"
  );

  log.info(`${codeCount + autoCount} discount(s) removed`);
}
