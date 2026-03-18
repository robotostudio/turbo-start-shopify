import { storefrontQuery } from "@/lib/shopify/client";
import type { MoneyV2, ShopifyImage } from "@/lib/shopify/types";

import { ProductCard } from "./product-card";

const RELATED_PRODUCTS_QUERY = /* graphql */ `
  query RelatedProducts($productId: ID!) {
    productRecommendations(productId: $productId) {
      id
      handle
      title
      vendor
      featuredImage {
        url
        altText
        width
        height
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
    }
  }
`;

type RelatedProductsResponse = {
  productRecommendations: Array<{
    id: string;
    handle: string;
    title: string;
    vendor: string;
    featuredImage: ShopifyImage | null;
    priceRange: {
      minVariantPrice: MoneyV2;
      maxVariantPrice: MoneyV2;
    };
  }>;
};

type RelatedProductsProps = {
  productId: string;
};

export async function RelatedProducts({ productId }: RelatedProductsProps) {
  const result = await storefrontQuery<RelatedProductsResponse>(
    RELATED_PRODUCTS_QUERY,
    { variables: { productId } }
  );

  if (!result.ok) return null;

  const products = result.data.productRecommendations.slice(0, 4);

  if (products.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="mb-6 font-medium font-(family-name:--font-geist-pixel-square) text-3xl">
        Related Products
      </h2>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            currencyCode={product.priceRange.minVariantPrice.currencyCode}
            imageUrl={product.featuredImage?.url ?? null}
            key={product.id}
            priceRange={{
              minVariantPrice: Number(
                product.priceRange.minVariantPrice.amount
              ),
              maxVariantPrice: Number(
                product.priceRange.maxVariantPrice.amount
              ),
            }}
            slug={product.handle}
            title={product.title}
            vendor={product.vendor}
          />
        ))}
      </div>
    </section>
  );
}
