/**
 * Shopify product variant webhook handler.
 *
 * Handles variant-level events for price, inventory, and availability changes.
 * Variant create/update/delete events are fired individually by Shopify when
 * a variant is managed independently (e.g. via the variant API).
 *
 * Webhook topics:
 *   - product_listings/update  (variant-level) — handled by products route
 *   - inventory_levels/update  → POST /api/webhooks/shopify/variants
 *   - inventory_items/update   → POST /api/webhooks/shopify/variants
 *
 * Note: For full variant sync (create/update/delete), the `products/update`
 * event on the products route is sufficient because Shopify includes the full
 * variant list. This route handles dedicated inventory-level events for more
 * granular stock updates.
 *
 * Supported topics routed here:
 *   - inventory_levels/update  → update availability on matching variant
 *   - inventory_levels/connect → update availability on matching variant
 *   - inventory_levels/disconnect → update availability on matching variant
 */

import { Logger } from "@workspace/logger";
import { writeClient } from "@workspace/sanity/write-client";
import { NextResponse } from "next/server";

import { verifyShopifyWebhook } from "@/lib/shopify/webhook";
import type { ShopifyWebhookInventoryLevel } from "@/lib/shopify/webhook-types";

const log = new Logger("webhook:variants");

export async function POST(request: Request) {
  const topic = request.headers.get("x-shopify-topic");

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
      case "inventory_levels/update":
      case "inventory_levels/connect":
      case "inventory_levels/disconnect": {
        await updateInventoryLevel(
          payload as ShopifyWebhookInventoryLevel,
          topic
        );
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
 * Updates the inventory availability on a Sanity `productVariant` document.
 *
 * When Shopify fires `inventory_levels/update`, the payload contains the
 * `inventory_item_id` and the `available` count at a location. We map the
 * inventory item back to a variant document via the variant's numeric ID
 * embedded in the Sanity document `_id` convention (`shopify-product-variant-<id>`).
 *
 * Because inventory_item_id ≠ variant_id we query Sanity to find the matching
 * variant by its `store.inventory.inventoryItemId` field if stored, or fall
 * back to the `inventory_item_id` directly on the variant store object.
 */
async function updateInventoryLevel(
  level: ShopifyWebhookInventoryLevel,
  topic: string
): Promise<void> {
  const { inventory_item_id, available } = level;

  // Find the productVariant document that owns this inventory item
  const variantDoc = await writeClient.fetch<{ _id: string } | null>(
    `*[_type == "productVariant" && store.inventoryItemId == $inventoryItemId][0]{ _id }`,
    { inventoryItemId: inventory_item_id }
  );

  if (!variantDoc) {
    // Variant not yet synced — nothing to update
    return;
  }

  const isAvailable =
    topic === "inventory_levels/disconnect" ? false : (available ?? 0) > 0;

  await writeClient
    .patch(variantDoc._id)
    .set({
      "store.inventory.isAvailable": isAvailable,
    })
    .commit({ returnDocuments: false });
}
