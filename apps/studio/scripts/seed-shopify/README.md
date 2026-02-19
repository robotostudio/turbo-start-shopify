# Shopify Seed Script

Generates faker-based products and seeds them into a Shopify store via the Admin GraphQL API. Supports **append mode** (run repeatedly to add more products) and **clean mode** (wipe everything).

## Setup

Add Shopify credentials to `apps/studio/.env`:

```env
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_...
```

The access token needs these Admin API scopes: `write_products`, `read_products`, `read_locations`, `write_discounts`, `read_discounts`.

## Usage

```bash
# Append 10 products (default)
pnpm seed:shopify

# Append a custom batch size
pnpm seed:shopify -- --batch=50

# Wipe all products, collections, and discounts
pnpm seed:shopify -- --clean

# Verbose output (debug-level logging)
pnpm seed:shopify -- --batch=20 --verbose
# or
pnpm seed:shopify -- --batch=20 -v

# Verify store state
pnpm verify:shopify
```

All commands can be run from the monorepo root — they delegate to `pnpm --filter studio`.

## What It Creates

### Products

5 category buckets, round-robin assigned per batch:

| Category    | Options        | Price Range | Weight    | Shopify Category       |
|-------------|----------------|-------------|-----------|------------------------|
| Apparel     | Size x Color   | $29–89      | 200–600g  | Clothing               |
| Accessories | Color          | $34–149     | 45–900g   | Clothing Accessories   |
| Footwear    | Size x Color   | $79–199     | 350g      | Shoes                  |
| Home        | single variant | $12–49      | 100–500g  | Home & Garden          |
| Digital     | single variant | $4–29       | 0g        | Software               |

Each product gets:
- Faker-generated title, vendor, description, tags
- 2–4 Unsplash stock images (curated per category)
- 25% chance of a compare-at (sale) price
- Random inventory quantities (0–50, digital = 9999)
- Globally unique handle and SKU (via per-run ID)

### Collections

| Collection   | Type   | Logic                              |
|--------------|--------|------------------------------------|
| All Products | manual | every product added                |
| New Arrivals | manual | ~40% of products                   |
| Sale         | smart  | tag = "sale"                       |
| Apparel      | smart  | productType = "Apparel"            |
| Accessories  | manual | Accessories + Footwear products    |

## Uniqueness

Three layers prevent collisions across runs:

1. **runId** — `{timestamp_base36}-{random4}`, unique per process
2. **Handle** — `{slugified-title}-{runId}-{idx}`
3. **SKU** — `{option-abbrevs}-{runId}-{idx}-{comboIdx}`

Plus a runtime check: queries `productByHandle` before creating — gracefully skips on collision.

## Architecture

```
scripts/seed-shopify/
  index.ts        CLI entry — flag parsing, mode selection, orchestration
  client.ts       Admin GraphQL client, error helpers, location lookup
  generate.ts     Faker-based product generator (pure, no I/O)
  products.ts     productSet mutation, image attachment
  collections.ts  Collection creation, product assignment
  cleanup.ts      Paginated deletion of products, collections, discounts
  types.ts        Shared interfaces

scripts/
  verify-shopify.ts   Queries store and prints verification report with health checks
```

## Verify Script

`pnpm verify:shopify` queries all products and collections, then prints:

- Collection summary (name, count, type)
- Products grouped by type (title, category, variants, images, inventory, sale flag, collections)
- Variant sample (SKU, price, compare-at, quantity)
- Health checks: images, variants, category, duplicate handles, duplicate SKUs
