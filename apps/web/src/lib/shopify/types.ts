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
  vendor: string;
  productType: string;
  tags: string[];
  options: ShopifyProductOption[];
  variants: Connection<ShopifyVariant>;
  images: Connection<ShopifyImage>;
  seo: { title: string | null; description: string | null };
  featuredImage: ShopifyImage | null;
};

export type ShopifyCollectionProduct = {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  productType: string;
  featuredImage: ShopifyImage | null;
  priceRange: {
    minVariantPrice: MoneyV2;
    maxVariantPrice: MoneyV2;
  };
  compareAtPriceRange?: {
    minVariantPrice: MoneyV2;
  };
  variants: Connection<
    Pick<ShopifyVariant, "id" | "availableForSale" | "quantityAvailable">
  >;
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
export type CartMutationResponse = {
  cartCreate?: { cart: Cart };
  cartLinesAdd?: { cart: Cart };
  cartLinesUpdate?: { cart: Cart };
  cartLinesRemove?: { cart: Cart };
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

export type FeaturedProduct = {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  featuredImage: ShopifyImage | null;
  priceRange: {
    minVariantPrice: MoneyV2;
    maxVariantPrice: MoneyV2;
  };
};

export type FeaturedProductsResponse = {
  products: Connection<FeaturedProduct>;
};

export type ProductByHandleResponse = {
  product: ShopifyCollectionProduct | null;
};
