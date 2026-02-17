import {
  ColorWheelIcon,
  ComposeIcon,
  InsertAboveIcon,
  SearchIcon,
} from "@sanity/icons";
import type { FieldGroupDefinition } from "sanity";

import ShopifyIcon from "@/components/icons/shopify";

// --- Field Groups (unified across all schemas) ---

export const GROUP = {
  CONTENT: "content",
  SEO: "seo",
  OG: "og",
  COMMERCE: "commerce",
  THEME: "theme",
} as const;

export const GROUPS: FieldGroupDefinition[] = [
  { name: GROUP.CONTENT, icon: ComposeIcon, title: "Content", default: true },
  { name: GROUP.SEO, icon: SearchIcon, title: "SEO" },
  { name: GROUP.OG, icon: InsertAboveIcon, title: "Open Graph" },
  { name: GROUP.THEME, icon: ColorWheelIcon, title: "Theme" },
  { name: GROUP.COMMERCE, icon: ShopifyIcon, title: "Shopify Sync" },
];

// --- Shopify ---

export const DEFAULT_CURRENCY_CODE = "USD";

export const LOCKED_DOCUMENT_TYPES = ["settings", "home", "media.tag"];

export const SHOPIFY_DOCUMENT_TYPES = [
  "product",
  "productVariant",
  "collection",
];

export const PAGE_REFERENCES = [
  { type: "collection" },
  { type: "homePage" },
  { type: "page" },
  { type: "product" },
];

export const SHOPIFY_STORE_ID = "";

// --- API ---

export const API_VERSION =
  process.env.SANITY_STUDIO_API_VERSION ?? "2025-05-08";
