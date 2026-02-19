/**
 * Shopify seed script — CLI entry point.
 *
 * Usage:
 *   pnpm seed:shopify                    # append 10 products
 *   pnpm seed:shopify -- --batch=20      # append 20 products
 *   pnpm seed:shopify -- --clean         # wipe all products, collections, discounts
 *   pnpm seed:shopify -- --verbose       # show debug-level output
 */

import { getDefaultLocationId, getStoreDomain, log } from "./client.js";
import { generateProducts } from "./generate.js";
import { createProducts } from "./products.js";
import {
  createCollections,
  assignProductsToCollections,
} from "./collections.js";
import {
  cleanAllProducts,
  cleanAllCollections,
  cleanAllDiscounts,
} from "./cleanup.js";
import { publishAll } from "./publish.js";
import type { RunStats } from "./types.js";

// ---------------------------------------------------------------------------
// Flag parsing
// ---------------------------------------------------------------------------

interface Flags {
  clean: boolean;
  batchSize: number;
  verbose: boolean;
}

function parseFlags(): Flags {
  let clean = false;
  let batchSize = 10;
  let verbose = false;

  for (const arg of process.argv.slice(2)) {
    if (arg === "--clean") clean = true;
    else if (arg === "--verbose" || arg === "-v") verbose = true;
    else if (arg.startsWith("--batch=")) {
      const n = parseInt(arg.slice("--batch=".length), 10);
      if (Number.isNaN(n) || n < 1) {
        log.error("--batch must be a positive integer");
        process.exit(1);
      }
      batchSize = n;
    }
  }

  return { clean, batchSize, verbose };
}

function makeRunId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 6);
  return `${ts}-${rand}`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const { clean, batchSize, verbose } = parseFlags();
  const domain = getStoreDomain();

  log.info(`Store: ${domain}`);

  // ── Clean mode ──────────────────────────────────────────────────────────
  if (clean) {
    log.info("Mode: CLEAN");
    try {
      await cleanAllProducts();
      await cleanAllCollections();
      await cleanAllDiscounts();
    } catch (err) {
      log.error(`Fatal: ${(err as Error).message}`);
      process.exit(1);
    }
    log.info("Store wiped.");
    return;
  }

  // ── Append mode ─────────────────────────────────────────────────────────
  const runId = makeRunId();
  log.info(`Mode: APPEND (batch=${batchSize}, run=${runId})`);

  const stats: RunStats = { created: 0, skipped: 0, failed: 0 };

  try {
    const locationId = await getDefaultLocationId();
    const collectionIds = await createCollections(stats, verbose);
    const products = generateProducts({ batchSize, runId });

    log.info(`Generated ${products.length} product definitions`);

    const productIds = await createProducts(
      products,
      locationId,
      stats,
      verbose
    );
    await assignProductsToCollections(
      products,
      productIds,
      collectionIds,
      verbose
    );
    await publishAll(productIds, collectionIds, verbose);
  } catch (err) {
    log.error(`Fatal: ${(err as Error).message}`);
    process.exit(1);
  }

  log.info(
    `Done — created:${stats.created} skipped:${stats.skipped} failed:${stats.failed}`
  );

  if (stats.failed > 0) {
    process.exit(1);
  }
}

main();
