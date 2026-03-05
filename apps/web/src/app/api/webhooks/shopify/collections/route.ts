/**
 * Shopify collection webhook handler.
 *
 * Handles collection create, update, and delete events from Shopify and keeps
 * the corresponding Sanity documents in sync.
 *
 * Webhook topics:
 *   - collections/create  → POST /api/webhooks/shopify/collections
 *   - collections/update  → POST /api/webhooks/shopify/collections
 *   - collections/delete  → POST /api/webhooks/shopify/collections
 *
 * The `x-shopify-topic` header determines which operation to perform.
 */

import { Logger } from "@workspace/logger";
import { writeClient } from "@workspace/sanity/write-client";
import { NextResponse } from "next/server";

import { verifyShopifyWebhook } from "@/lib/shopify/webhook";
import type {
  ShopifyWebhookCollection,
  ShopifyWebhookCollectionDelete,
} from "@/lib/shopify/webhook-types";

const log = new Logger("webhook:collections");

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
      case "collections/create":
      case "collections/update": {
        await upsertCollection(payload as ShopifyWebhookCollection, shopDomain);
        break;
      }
      case "collections/delete": {
        await deleteCollection(payload as ShopifyWebhookCollectionDelete);
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
 * Upserts a Sanity `collection` document from a Shopify webhook payload.
 *
 * Matches an existing document by deterministic `_id` derived from the
 * Shopify collection ID. If no match is found, a new document is created.
 */
async function upsertCollection(
  collection: ShopifyWebhookCollection,
  shopDomain: string
): Promise<void> {
  const collectionId = `shopify-collection-${collection.id}`;
  const collectionGid = collection.admin_graphql_api_id;

  const rules = collection.rules.map((rule, idx) => ({
    _key: `rule-${idx}`,
    _type: "collectionRule",
    column: rule.column,
    relation: rule.relation,
    condition: rule.condition,
  }));

  const storeData = {
    id: collection.id,
    gid: collectionGid,
    title: collection.title,
    slug: { current: collection.handle, _type: "slug" },
    descriptionHtml: collection.body_html ?? "",
    updatedAt: collection.updated_at,
    isDeleted: false,
    imageUrl: collection.image?.src ?? null,
    rules,
    disjunctive: collection.disjunctive,
    sortOrder: collection.sort_order,
    shop: { domain: shopDomain },
  };

  await writeClient
    .patch(collectionId)
    .setIfMissing({
      _id: collectionId,
      _type: "collection",
      titleProxy: collection.title,
      slugProxy: collection.handle,
    })
    .set({ store: storeData })
    .commit({ returnDocuments: false });
}

/**
 * Marks a Sanity `collection` document as deleted when the collection is
 * removed from Shopify. The document is retained in Sanity so content editors
 * do not lose any custom fields or editorial content.
 */
async function deleteCollection(
  payload: ShopifyWebhookCollectionDelete
): Promise<void> {
  const collectionId = `shopify-collection-${payload.id}`;

  await writeClient
    .patch(collectionId)
    .set({ "store.isDeleted": true })
    .commit({ returnDocuments: false });
}
