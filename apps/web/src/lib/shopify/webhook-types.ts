/** Shopify webhook payload types for products, variants, and collections. */

export type ShopifyWebhookProductStatus = "active" | "archived" | "draft";

export type ShopifyWebhookImage = {
  id: number;
  src: string;
  alt: string | null;
  position: number;
  product_id: number;
  created_at: string;
  updated_at: string;
  width: number;
  height: number;
};

export type ShopifyWebhookInventoryManagement =
  | "shopify"
  | "not_managed"
  | string;

export type ShopifyWebhookInventoryPolicy = "deny" | "continue";

export type ShopifyWebhookVariant = {
  id: number;
  product_id: number;
  title: string;
  price: string;
  compare_at_price: string | null;
  sku: string | null;
  position: number;
  inventory_policy: ShopifyWebhookInventoryPolicy;
  fulfillment_service: string;
  inventory_management: ShopifyWebhookInventoryManagement | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  created_at: string;
  updated_at: string;
  taxable: boolean;
  barcode: string | null;
  grams: number;
  image_id: number | null;
  weight: number;
  weight_unit: string;
  inventory_item_id: number;
  inventory_quantity: number;
  old_inventory_quantity: number;
  requires_shipping: boolean;
  admin_graphql_api_id: string;
};

export type ShopifyWebhookProductOption = {
  id: number;
  product_id: number;
  name: string;
  position: number;
  values: string[];
};

export type ShopifyWebhookProduct = {
  id: number;
  title: string;
  body_html: string | null;
  vendor: string;
  product_type: string;
  created_at: string;
  handle: string;
  updated_at: string;
  published_at: string | null;
  template_suffix: string | null;
  published_scope: string;
  tags: string;
  status: ShopifyWebhookProductStatus;
  admin_graphql_api_id: string;
  variants: ShopifyWebhookVariant[];
  options: ShopifyWebhookProductOption[];
  images: ShopifyWebhookImage[];
  image: ShopifyWebhookImage | null;
};

export type ShopifyWebhookProductDelete = {
  id: number;
};

export type ShopifyWebhookCollectionRule = {
  column: string;
  relation: string;
  condition: string;
};

export type ShopifyWebhookCollection = {
  id: number;
  handle: string;
  title: string;
  updated_at: string;
  body_html: string | null;
  published_at: string | null;
  sort_order: string;
  template_suffix: string | null;
  published_scope: string;
  admin_graphql_api_id: string;
  rules: ShopifyWebhookCollectionRule[];
  disjunctive: boolean;
  image: {
    created_at: string;
    alt: string | null;
    width: number;
    height: number;
    src: string;
  } | null;
};

export type ShopifyWebhookCollectionDelete = {
  id: number;
};

export type ShopifyWebhookInventoryLevel = {
  inventory_item_id: number;
  location_id: number;
  available: number | null;
  updated_at: string;
  admin_graphql_api_id: string;
};
