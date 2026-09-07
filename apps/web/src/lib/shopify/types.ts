export const LOW_STOCK_THRESHOLD = 5;

export type MoneyV2 = {
  amount: string;
  currencyCode: string;
};

export type ShopifyImage = {
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

export type ShopifyProductOption = {
  id: string;
  name: string;
  values: string[];
};

export type ShopifyMetafield = {
  key: string;
  namespace: string;
  value: string;
  type: string;
};

export type SelectedOption = {
  name: string;
  value: string;
};

export type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: MoneyV2;
  compareAtPrice: MoneyV2 | null;
  selectedOptions: SelectedOption[];
  image: ShopifyImage | null;
  sku: string | null;
  quantityAvailable: number | null;
};

export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  updatedAt: string;
  vendor: string;
  productType: string;
  tags: string[];
  collections: Connection<{ handle: string }>;
  options: ShopifyProductOption[];
  variants: Connection<ShopifyVariant>;
  images: Connection<ShopifyImage>;
  seo: { title: string | null; description: string | null };
  featuredImage: ShopifyImage | null;
  /** Positional array matching the `identifiers` order in PRODUCT_QUERY. */
  metafields: (ShopifyMetafield | null)[];
};

export type ShopifyCollectionProduct = {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  productType: string;
  tags: string[];
  options: ShopifyProductOption[];
  featuredImage: ShopifyImage | null;
  /** Product gallery, used to derive the product card's hover cross-fade. */
  images?: Connection<CardImageFields>;
  priceRange: {
    minVariantPrice: MoneyV2;
    maxVariantPrice: MoneyV2;
  };
  compareAtPriceRange?: {
    minVariantPrice: MoneyV2;
  };
  variants: Connection<CardVariantFields>;
};

/**
 * Image fields card queries select. Cards render with `fill` and take alt text
 * from the product title, so `url` is all any card path reads.
 */
export type CardImageFields = Pick<ShopifyImage, "url">;

/**
 * Variant fields every product-card query selects. `image` drives the card's
 * photo swap when a color swatch is picked.
 */
export type CardVariantFields = Pick<
  ShopifyVariant,
  "id" | "availableForSale" | "quantityAvailable" | "price" | "selectedOptions"
> & { image: CardImageFields | null };

/**
 * Minimum product shape `collectionProductToCardProps` accepts, covering both
 * collection products and the product-level stock fields carried by featured
 * products.
 */
export type CardSourceProduct = Omit<
  ShopifyCollectionProduct,
  "productType"
> & {
  productType?: string;
  /** Product-level stock, selected only by the featured/card-fields queries. */
  availableForSale?: boolean;
  totalInventory?: number | null;
};

export type ShopifyFilterValue = {
  id: string;
  label: string;
  count: number;
  input: string;
};

export type ShopifyFilter = {
  id: string;
  label: string;
  type: string;
  values: ShopifyFilterValue[];
};

export type ShopifyCollection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ShopifyImage | null;
  products: Connection<ShopifyCollectionProduct> & {
    filters: ShopifyFilter[];
  };
};

export type CartLine = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    image: ShopifyImage | null;
    product: {
      handle: string;
      title: string;
    };
    selectedOptions: SelectedOption[];
    price: MoneyV2;
  };
  cost: {
    amountPerQuantity: MoneyV2;
    totalAmount: MoneyV2;
  };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: Connection<CartLine>;
  cost: {
    totalAmount: MoneyV2;
    subtotalAmount: MoneyV2;
    totalTaxAmount: MoneyV2 | null;
  };
};

export type CartLineInput = {
  merchandiseId: string;
  quantity: number;
};

export type Connection<T> = {
  edges: { node: T }[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
};

export type ProductQueryResponse = { product: ShopifyProduct };
export type CollectionQueryResponse = { collection: ShopifyCollection };
export type CartQueryResponse = { cart: Cart };
export type ShopifyCartUserError = {
  field: string[] | null;
  message: string;
  code: string | null;
};

export type ShopifyCartWarning = {
  code: string;
  message: string;
  target: string | null;
};

export type CartMutationPayload = {
  cart: Cart | null;
  userErrors: ShopifyCartUserError[];
  warnings: ShopifyCartWarning[];
};

export type CartMutationResponse = {
  cartCreate?: CartMutationPayload;
  cartLinesAdd?: CartMutationPayload;
  cartLinesUpdate?: CartMutationPayload;
  cartLinesRemove?: CartMutationPayload;
};
export type RecommendedProductsResponse = {
  productRecommendations: ShopifyProduct[];
};

export type ShopifyCollectionListItem = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ShopifyImage | null;
};

export type AllCollectionsResponse = {
  collections: Connection<ShopifyCollectionListItem>;
};

export type SearchProductsResponse = {
  search: {
    edges: { node: ShopifyCollectionProduct }[];
    totalCount: number;
  };
};

export type ShopifyCollectionLite = {
  id: string;
  handle: string;
  title: string;
  image: ShopifyImage | null;
};

export type PredictiveSearchResponse = {
  predictiveSearch: {
    products: ShopifyCollectionProduct[];
    collections: ShopifyCollectionLite[];
    queries: { text: string }[];
  };
};

export type BestSellingProductsResponse = {
  products: Connection<ShopifyCollectionProduct>;
};

export type FeaturedProduct = {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  tags: string[];
  options: ShopifyProductOption[];
  availableForSale: boolean;
  totalInventory: number | null;
  variants: Connection<CardVariantFields>;
  featuredImage: ShopifyImage | null;
  /** Product gallery, used to derive the product card's hover cross-fade. */
  images?: Connection<CardImageFields>;
  priceRange: {
    minVariantPrice: MoneyV2;
    maxVariantPrice: MoneyV2;
  };
  compareAtPriceRange?: {
    minVariantPrice: MoneyV2;
  };
};

export type FeaturedProductsResponse = {
  products: Connection<FeaturedProduct>;
};

export type ProductByHandleResponse = {
  product: ShopifyCollectionProduct | null;
};
