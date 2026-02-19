/** Shared types for the Shopify seed script. */

export interface GqlResponse<T = Record<string, unknown>> {
  data?: T;
  errors?: Array<{ message: string; locations?: unknown; path?: unknown[] }>;
}

export interface UserError {
  field?: string[];
  message: string;
}

export interface CollectionRule {
  column: string;
  relation: string;
  condition: string;
}

export interface CollectionDef {
  handle: string;
  title: string;
  descriptionHtml: string;
  ruleSet: {
    appliedDisjunctively: boolean;
    rules: CollectionRule[];
  } | null;
}

export interface VariantDef {
  options: string[];
  price: string;
  compareAtPrice?: string;
  sku: string;
  inventoryQuantity: number;
  inventoryPolicy?: "DENY" | "CONTINUE";
  requiresShipping?: boolean;
  weight: number;
  weightUnit: string;
}

export interface ProductDef {
  handle: string;
  title: string;
  descriptionHtml: string;
  productType: string;
  category: string;
  vendor: string;
  tags: string[];
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  options: string[];
  variants: VariantDef[];
  images: Array<{ src: string; alt: string }>;
  collections: string[];
}

export interface PaginatedField<T> {
  edges: Array<{ cursor: string; node: T }>;
  pageInfo: { hasNextPage: boolean };
}

export interface GeneratorOptions {
  batchSize: number;
  runId: string;
}

export interface RunStats {
  created: number;
  skipped: number;
  failed: number;
}
