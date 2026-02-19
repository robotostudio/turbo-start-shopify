/**
 * Queries Shopify Admin API and prints a store verification report.
 *
 * Usage: pnpm verify:shopify
 */

import {
  fetchPaginated,
  getStoreDomain,
  log,
} from "./seed-shopify/client.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProductNode {
  id: string;
  title: string;
  handle: string;
  status: string;
  productType: string;
  category: { name: string } | null;
  vendor: string;
  totalVariants: number;
  totalInventory: number;
  images: { edges: Array<{ node: { url: string } }> };
  collections: { edges: Array<{ node: { title: string } }> };
  variants: {
    edges: Array<{
      node: {
        sku: string;
        price: string;
        compareAtPrice: string | null;
        inventoryQuantity: number;
      };
    }>;
  };
}

interface CollectionNode {
  id: string;
  title: string;
  handle: string;
  productsCount: { count: number };
  ruleSet: { rules: Array<{ column: string; condition: string }> } | null;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

const PRODUCTS_QUERY = `query($cursor: String) {
  products(first: 50, after: $cursor) {
    edges {
      cursor
      node {
        id title handle status productType vendor
        category { name }
        totalVariants totalInventory
        images(first: 5) { edges { node { url } } }
        collections(first: 10) { edges { node { title } } }
        variants(first: 10) {
          edges {
            node { sku price compareAtPrice inventoryQuantity }
          }
        }
      }
    }
    pageInfo { hasNextPage }
  }
}`;

const COLLECTIONS_QUERY = `query($cursor: String) {
  collections(first: 50, after: $cursor) {
    edges {
      cursor
      node {
        id title handle
        productsCount { count }
        ruleSet { rules { column condition } }
      }
    }
    pageInfo { hasNextPage }
  }
}`;

// ---------------------------------------------------------------------------
// Display
// ---------------------------------------------------------------------------

function printSummary(
  products: ProductNode[],
  collections: CollectionNode[]
): void {
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  SHOPIFY STORE VERIFICATION REPORT");
  console.log("═══════════════════════════════════════════════════════\n");

  console.log(`COLLECTIONS (${collections.length})`);
  console.log("─────────────────────────────────────────────────────");
  for (const col of collections) {
    const type = col.ruleSet?.rules?.length ? "smart" : "manual";
    console.log(
      `  ${col.title.padEnd(25)} ${String(col.productsCount.count).padStart(4)} products  (${type})`
    );
  }

  console.log(`\nPRODUCTS (${products.length})`);
  console.log("─────────────────────────────────────────────────────");

  const byType: Record<string, ProductNode[]> = {};
  for (const p of products) {
    const t = p.productType || "Unknown";
    if (!byType[t]) byType[t] = [];
    byType[t]!.push(p);
  }

  for (const [type, items] of Object.entries(byType)) {
    console.log(`\n  ${type} (${items.length})`);
    for (const p of items.slice(0, 10)) {
      const imgCount = p.images.edges.length;
      const varCount = p.totalVariants;
      const inv = p.totalInventory;
      const cat = p.category?.name ?? "—";
      const cols = p.collections.edges.map((e) => e.node.title).join(", ");
      const hasCompare = p.variants.edges.some(
        (e) => e.node.compareAtPrice !== null
      );
      console.log(
        `    ${p.status === "ACTIVE" ? "+" : "o"} ${p.title.slice(0, 35).padEnd(37)} cat:${cat.padEnd(22)} ${String(varCount).padStart(3)}v  ${String(imgCount).padStart(2)}img  inv:${String(inv).padStart(5)}${hasCompare ? "  SALE" : ""}  [${cols}]`
      );
    }
    if (items.length > 10) console.log(`    … and ${items.length - 10} more`);
  }

  // Variant sample
  console.log("\nVARIANT SAMPLE (first 3 products)");
  console.log("─────────────────────────────────────────────────────");
  for (const p of products.slice(0, 3)) {
    console.log(`\n  ${p.title} (${p.handle})`);
    for (const { node: v } of p.variants.edges) {
      const compare = v.compareAtPrice ? ` (was $${v.compareAtPrice})` : "";
      console.log(
        `    SKU: ${v.sku.padEnd(30)} $${v.price}${compare}  qty:${v.inventoryQuantity}`
      );
    }
  }

  // Health checks
  console.log("\nHEALTH CHECKS");
  console.log("─────────────────────────────────────────────────────");

  const noImages = products.filter((p) => p.images.edges.length === 0);
  const noVariants = products.filter((p) => p.totalVariants === 0);
  const noCategory = products.filter((p) => !p.category);
  const dupeHandles = findDuplicates(products.map((p) => p.handle));
  const dupeSkus = findDuplicates(
    products.flatMap((p) => p.variants.edges.map((e) => e.node.sku))
  );

  check("All products have images", noImages.length === 0, noImages.map((p) => p.handle));
  check("All products have variants", noVariants.length === 0, noVariants.map((p) => p.handle));
  check("All products have category", noCategory.length === 0, noCategory.map((p) => p.handle));
  check("No duplicate handles", dupeHandles.length === 0, dupeHandles);
  check("No duplicate SKUs", dupeSkus.length === 0, dupeSkus.slice(0, 5));

  console.log("\n═══════════════════════════════════════════════════════\n");
}

function check(label: string, pass: boolean, details: string[]): void {
  if (pass) {
    console.log(`  PASS  ${label}`);
  } else {
    console.log(`  FAIL  ${label}: ${details.join(", ")}`);
  }
}

function findDuplicates(arr: string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const item of arr) {
    if (seen.has(item)) dupes.add(item);
    seen.add(item);
  }
  return [...dupes];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const domain = getStoreDomain();
  log.info(`Verifying: ${domain}`);

  try {
    const [products, collections] = await Promise.all([
      fetchPaginated<ProductNode>(PRODUCTS_QUERY, "products"),
      fetchPaginated<CollectionNode>(COLLECTIONS_QUERY, "collections"),
    ]);
    printSummary(products, collections);
  } catch (err) {
    log.error(`Fatal: ${(err as Error).message}`);
    process.exit(1);
  }
}

main();
