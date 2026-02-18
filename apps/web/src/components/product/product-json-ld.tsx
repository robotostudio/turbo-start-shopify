import type { ShopifyProduct } from "@/lib/shopify/types";
import { getBaseUrl } from "@/utils";

type ProductJsonLdProps = {
  product: ShopifyProduct;
  handle: string;
};

export function ProductJsonLd({ product, handle }: ProductJsonLdProps) {
  const baseUrl = getBaseUrl();
  const variants = product.variants.edges.map((e) => e.node);
  const firstImage = product.images.edges[0]?.node;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: firstImage?.url,
    brand: product.vendor
      ? { "@type": "Brand", name: product.vendor }
      : undefined,
    offers: variants.map((v) => ({
      "@type": "Offer",
      price: v.price.amount,
      priceCurrency: v.price.currencyCode,
      availability: v.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${baseUrl}/products/${handle}`,
    })),
  };

  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      type="application/ld+json"
    />
  );
}
