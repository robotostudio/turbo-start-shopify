/** Product creation and image attachment via Shopify Admin API. */

import { adminQuery, hasUserErrors, log } from "./client.js";
import type { ProductDef, RunStats, UserError } from "./types.js";

/** Creates a product via productSet. Skips if handle already exists. */
export async function createProduct(
  prod: ProductDef,
  locationId: string,
  stats: RunStats,
  verbose: boolean
): Promise<string | null> {
  const check = await adminQuery<{
    productByHandle: { id: string; title: string } | null;
  }>(
    `query($handle: String!) {
      productByHandle(handle: $handle) { id title }
    }`,
    { handle: prod.handle }
  );

  if (check.data?.productByHandle) {
    if (verbose) log.info(`Skipped (exists): ${prod.title}`);
    stats.skipped++;
    return check.data.productByHandle.id;
  }

  const productOptions = prod.options.map((optName, optIdx) => {
    const values = [
      ...new Set(
        prod.variants.map((v) => v.options[optIdx]).filter(Boolean)
      ),
    ];
    return { name: optName, values: values.map((name) => ({ name })) };
  });

  const variantsInput = prod.variants.map((v) => {
    const optionValues = prod.options.map((optName, i) => ({
      optionName: optName,
      name: v.options[i],
    }));

    const variantInput: Record<string, unknown> = {
      optionValues,
      price: v.price,
      sku: v.sku,
      inventoryPolicy: v.inventoryPolicy ?? "DENY",
      inventoryItem: {
        requiresShipping: v.requiresShipping !== false,
        measurement: {
          weight: { value: v.weight ?? 0, unit: v.weightUnit ?? "GRAMS" },
        },
      },
    };

    if (v.compareAtPrice) variantInput.compareAtPrice = v.compareAtPrice;

    if ((v.inventoryQuantity ?? 0) > 0) {
      variantInput.inventoryQuantities = [
        { locationId, name: "available", quantity: v.inventoryQuantity },
      ];
    }

    return variantInput;
  });

  const input: Record<string, unknown> = {
    title: prod.title,
    handle: prod.handle,
    descriptionHtml: prod.descriptionHtml,
    productType: prod.productType,
    category: prod.category,
    vendor: prod.vendor,
    tags: prod.tags,
    status: prod.status,
    productOptions,
    variants: variantsInput,
  };

  const result = await adminQuery<{
    productSet: {
      product: {
        id: string;
        title: string;
        variants: { edges: Array<{ node: { id: string } }> };
      } | null;
      userErrors: UserError[];
    };
  }>(
    `mutation($input: ProductSetInput!) {
      productSet(synchronous: true, input: $input) {
        product {
          id title
          variants(first: 20) { edges { node { id } } }
        }
        userErrors { field message }
      }
    }`,
    { input }
  );

  if (result.errors) {
    log.error(
      `Product:${prod.handle} — GraphQL: ${JSON.stringify(result.errors)}`
    );
    stats.failed++;
    return null;
  }

  const { product, userErrors } = result.data?.productSet ?? {};
  if (hasUserErrors(userErrors, `Product:${prod.handle}`)) {
    stats.failed++;
    return null;
  }
  if (!product) {
    log.error(`Product:${prod.handle} — no product returned`);
    stats.failed++;
    return null;
  }

  log.info(
    `Created: ${product.title} (${prod.variants.length} variants)`
  );
  stats.created++;

  await attachProductImages(product.id, prod, verbose);
  return product.id;
}

/** Attaches stock images to a product. */
async function attachProductImages(
  productId: string,
  prod: ProductDef,
  verbose: boolean
): Promise<void> {
  const mediaItems = prod.images.map((img) => ({
    originalSource: img.src,
    alt: img.alt,
    mediaContentType: "IMAGE",
  }));

  const result = await adminQuery<{
    productCreateMedia: {
      media: Array<{ mediaContentType: string; status: string }>;
      mediaUserErrors: UserError[];
    };
  }>(
    `mutation($productId: ID!, $media: [CreateMediaInput!]!) {
      productCreateMedia(productId: $productId, media: $media) {
        media { mediaContentType status }
        mediaUserErrors { field message }
      }
    }`,
    { productId, media: mediaItems }
  );

  const { mediaUserErrors } = result.data?.productCreateMedia ?? {};
  if (mediaUserErrors?.length) {
    for (const e of mediaUserErrors) {
      log.warn(`Image for ${productId}: ${e.message}`);
    }
  } else if (verbose) {
    log.info(`  ${prod.images.length} images attached`);
  }
}

/** Creates all products sequentially. Returns handle→GID map. */
export async function createProducts(
  products: ProductDef[],
  locationId: string,
  stats: RunStats,
  verbose: boolean
): Promise<Record<string, string>> {
  log.info(`Creating ${products.length} products…`);
  const ids: Record<string, string> = {};
  for (const prod of products) {
    const id = await createProduct(prod, locationId, stats, verbose);
    if (id) ids[prod.handle] = id;
  }
  return ids;
}
