/**
 * Shopify product webhook handler.
 *
 * Handles product create, update, and delete events from Shopify and keeps
 * the corresponding Sanity documents in sync.
 *
 * Webhook topics:
 *   - products/create  → POST /api/webhooks/shopify/products
 *   - products/update  → POST /api/webhooks/shopify/products
 *   - products/delete  → POST /api/webhooks/shopify/products
 *
 * The `x-shopify-topic` header determines which operation to perform.
 */

import { Logger } from "@workspace/logger";
import { writeClient } from "@workspace/sanity/write-client";
import { NextResponse } from "next/server";

import { verifyShopifyWebhook } from "@/lib/shopify/webhook";
import type {
  ShopifyWebhookProduct,
  ShopifyWebhookProductDelete,
  ShopifyWebhookVariant,
} from "@/lib/shopify/webhook-types";

const log = new Logger("webhook:products");

export async function POST(request: Request) {
  const topic = request.headers.get("x-shopify-topic");
  const shopDomain = request.headers.get("x-shopify-shop-domain") ?? "";

  const verified = await verifyShopifyWebhook(request);
  if (!verified.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(verified.rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    switch (topic) {
      case "products/create":
      case "products/update": {
        await upsertProduct(payload as ShopifyWebhookProduct, shopDomain);
        break;
      }
      case "products/delete": {
        await deleteProduct(payload as ShopifyWebhookProductDelete);
        break;
      }
      default: {
        return NextResponse.json(
          { error: `Unhandled topic: ${topic}` },
          { status: 400 }
        );
      }
    }
  } catch (err) {
    log.error(
      `${topic} failed: ${err instanceof Error ? err.message : String(err)}`
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

/**
 * Upserts a Sanity `product` document from a Shopify webhook payload.
 *
 * Matches an existing document by `store.gid`. If no match is found, a new
 * document is created with a deterministic `_id` derived from the Shopify GID.
 *
 * Variants are synced as separate `productVariant` documents and cross-linked
 * via weak references on the product's `store.variants` array.
 */
async function upsertProduct(
  product: ShopifyWebhookProduct,
  shopDomain: string
): Promise<void> {
  const productGid = product.admin_graphql_api_id;
  const productId = `shopify-product-${product.id}`;

  // Upsert each variant as a separate productVariant document
  const variantRefs = await Promise.all(
    product.variants.map((variant) =>
      upsertVariant(variant, product, shopDomain)
    )
  );

  const previewImageUrl = product.image?.src ?? product.images[0]?.src ?? null;

  const minPrice = product.variants.reduce(
    (min, v) => Math.min(min, parseFloat(v.price)),
    Infinity
  );
  const maxPrice = product.variants.reduce(
    (max, v) => Math.max(max, parseFloat(v.price)),
    -Infinity
  );

  const storeData = {
    id: product.id,
    gid: productGid,
    title: product.title,
    slug: { current: product.handle, _type: "slug" },
    descriptionHtml: product.body_html ?? "",
    productType: product.product_type,
    vendor: product.vendor,
    tags: product.tags,
    status: product.status,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
    isDeleted: false,
    previewImageUrl,
    priceRange: {
      _type: "priceRange",
      minVariantPrice: Number.isFinite(minPrice) ? minPrice : 0,
      maxVariantPrice: Number.isFinite(maxPrice) ? maxPrice : 0,
    },
    options: product.options.map((opt) => ({
      _key: `option-${opt.id}`,
      _type: "option",
      name: opt.name,
      values: opt.values,
    })),
    shop: { domain: shopDomain },
    variants: variantRefs.map((ref) => ({
      _key: ref._key,
      _type: "reference",
      _ref: ref._id,
      _weak: true,
    })),
  };

  await writeClient
    .patch(productId)
    .setIfMissing({
      _id: productId,
      _type: "product",
      titleProxy: product.title,
      slugProxy: product.handle,
    })
    .set({ store: storeData })
    .commit({ returnDocuments: false });
}

/**
 * Upserts a Sanity `productVariant` document and returns its `_id` and `_key`.
 */
async function upsertVariant(
  variant: ShopifyWebhookVariant,
  product: ShopifyWebhookProduct,
  shopDomain: string
): Promise<{ _id: string; _key: string }> {
  const variantId = `shopify-product-variant-${variant.id}`;
  const variantGid = variant.admin_graphql_api_id;

  const previewImageUrl =
    variant.image_id != null
      ? (product.images.find((img) => img.id === variant.image_id)?.src ?? null)
      : null;

  const storeData = {
    id: variant.id,
    gid: variantGid,
    productId: product.id,
    productGid: product.admin_graphql_api_id,
    title: variant.title,
    sku: variant.sku,
    price: parseFloat(variant.price),
    compareAtPrice: variant.compare_at_price
      ? parseFloat(variant.compare_at_price)
      : null,
    createdAt: variant.created_at,
    updatedAt: variant.updated_at,
    status: product.status,
    isDeleted: false,
    option1: variant.option1,
    option2: variant.option2,
    option3: variant.option3,
    previewImageUrl,
    // Stored so inventory_levels webhooks can look up the variant by item ID
    inventoryItemId: variant.inventory_item_id,
    inventory: {
      _type: "inventory",
      isAvailable:
        variant.inventory_quantity > 0 ||
        variant.inventory_policy === "continue",
      management: variant.inventory_management ?? "not_managed",
      policy: variant.inventory_policy,
    },
    shop: { domain: shopDomain },
  };

  await writeClient
    .patch(variantId)
    .setIfMissing({
      _id: variantId,
      _type: "productVariant",
      titleProxy: variant.title,
    })
    .set({ store: storeData })
    .commit({ returnDocuments: false });

  return { _id: variantId, _key: `variant-${variant.id}` };
}

/**
 * Marks a Sanity `product` document as deleted when the product is removed
 * from Shopify. The document is retained in Sanity so content editors do not
 * lose any custom fields or SEO data.
 */
async function deleteProduct(
  payload: ShopifyWebhookProductDelete
): Promise<void> {
  const productId = `shopify-product-${payload.id}`;

  await writeClient
    .patch(productId)
    .set({ "store.isDeleted": true })
    .commit({ returnDocuments: false });
}
