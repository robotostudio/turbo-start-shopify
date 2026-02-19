/** Collection creation and product-to-collection assignment. */

import { adminQuery, hasUserErrors, log } from "./client.js";
import type {
  CollectionDef,
  ProductDef,
  RunStats,
  UserError,
} from "./types.js";

export const COLLECTIONS: CollectionDef[] = [
  {
    handle: "all-products",
    title: "All Products",
    descriptionHtml: "<p>Browse our complete product catalog.</p>",
    ruleSet: null,
  },
  {
    handle: "new-arrivals",
    title: "New Arrivals",
    descriptionHtml: "<p>The latest additions to our store.</p>",
    ruleSet: null,
  },
  {
    handle: "sale",
    title: "Sale",
    descriptionHtml: "<p>Products on sale with a reduced price.</p>",
    ruleSet: {
      appliedDisjunctively: false,
      rules: [
        { column: "IS_PRICE_REDUCED", relation: "IS_SET", condition: "" },
      ],
    },
  },
  {
    handle: "apparel",
    title: "Apparel",
    descriptionHtml: "<p>Clothing and wearables.</p>",
    ruleSet: {
      appliedDisjunctively: false,
      rules: [{ column: "TYPE", relation: "EQUALS", condition: "Apparel" }],
    },
  },
  {
    handle: "accessories",
    title: "Accessories",
    descriptionHtml: "<p>Bags, hats, and more.</p>",
    ruleSet: null,
  },
];

const MANUAL_HANDLES = ["all-products", "new-arrivals", "accessories"];

// ---------------------------------------------------------------------------
// Collection CRUD
// ---------------------------------------------------------------------------

async function createCollection(
  col: CollectionDef,
  stats: RunStats,
  verbose: boolean
): Promise<string | null> {
  const check = await adminQuery<{
    collectionByHandle: { id: string; title: string } | null;
  }>(
    `query($handle: String!) {
      collectionByHandle(handle: $handle) { id title }
    }`,
    { handle: col.handle }
  );

  if (check.data?.collectionByHandle) {
    if (verbose) log.info(`Collection exists: ${col.title}`);
    stats.skipped++;
    return check.data.collectionByHandle.id;
  }

  const input: Record<string, unknown> = {
    title: col.title,
    handle: col.handle,
    descriptionHtml: col.descriptionHtml,
    ...(col.ruleSet ? { ruleSet: col.ruleSet } : {}),
  };

  const result = await adminQuery<{
    collectionCreate: {
      collection: { id: string; title: string } | null;
      userErrors: UserError[];
    };
  }>(
    `mutation($input: CollectionInput!) {
      collectionCreate(input: $input) {
        collection { id title }
        userErrors { field message }
      }
    }`,
    { input }
  );

  if (result.errors) {
    log.error(
      `Collection:${col.handle} — ${JSON.stringify(result.errors)}`
    );
    stats.failed++;
    return null;
  }

  const { collection, userErrors } = result.data?.collectionCreate ?? {};
  if (hasUserErrors(userErrors, `Collection:${col.handle}`)) {
    stats.failed++;
    return null;
  }
  if (!collection) {
    log.error(`Collection:${col.handle} — no collection returned`);
    stats.failed++;
    return null;
  }

  log.info(`Collection created: ${collection.title}`);
  stats.created++;
  return collection.id;
}

/** Creates all collections (idempotent). Returns handle→GID map. */
export async function createCollections(
  stats: RunStats,
  verbose: boolean
): Promise<Record<string, string>> {
  log.info("Creating collections…");
  const ids: Record<string, string> = {};
  for (const col of COLLECTIONS) {
    const id = await createCollection(col, stats, verbose);
    if (id) ids[col.handle] = id;
  }
  return ids;
}

// ---------------------------------------------------------------------------
// Product → Collection assignment (fire-and-forget)
// ---------------------------------------------------------------------------

/**
 * Adds a product to a manual collection.
 * Fire-and-forget — Shopify processes the job async.
 */
async function addProductToCollection(
  productId: string,
  collectionId: string
): Promise<boolean> {
  const result = await adminQuery<{
    collectionAddProductsV2: {
      job: { id: string } | null;
      userErrors: UserError[];
    };
  }>(
    `mutation($id: ID!, $productIds: [ID!]!) {
      collectionAddProductsV2(id: $id, productIds: $productIds) {
        job { id }
        userErrors { field message }
      }
    }`,
    { id: collectionId, productIds: [productId] }
  );

  if (result.errors) {
    log.error(`Collection assign: ${JSON.stringify(result.errors)}`);
    return false;
  }

  const { userErrors } = result.data?.collectionAddProductsV2 ?? {};
  if (hasUserErrors(userErrors, `AddToCollection:${collectionId}`)) {
    return false;
  }

  return true;
}

/** Assigns products to their manual collections. */
export async function assignProductsToCollections(
  products: ProductDef[],
  productIds: Record<string, string>,
  collectionIds: Record<string, string>,
  verbose: boolean
): Promise<void> {
  log.info("Assigning products to manual collections…");
  let assigned = 0;

  for (const prod of products) {
    const productId = productIds[prod.handle];
    if (!productId || !prod.collections?.length) continue;
    for (const colHandle of prod.collections) {
      if (!MANUAL_HANDLES.includes(colHandle)) continue;
      const collectionId = collectionIds[colHandle];
      if (!collectionId) continue;
      if (verbose) log.info(`  ${prod.handle} → ${colHandle}`);
      const ok = await addProductToCollection(productId, collectionId);
      if (ok) assigned++;
    }
  }

  log.info(`${assigned} collection assignments dispatched`);
}
