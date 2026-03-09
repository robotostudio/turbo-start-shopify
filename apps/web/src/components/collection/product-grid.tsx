import Image from "next/image";
import Link from "next/link";

import { formatMoney } from "@/lib/shopify/money";
import type { ShopifyCollectionProduct } from "@/lib/shopify/types";

type ProductGridProps = {
  products: ShopifyCollectionProduct[];
};

function getSalePercentage(product: ShopifyCollectionProduct): number | null {
  const compareAt = product.compareAtPriceRange?.minVariantPrice;
  if (!compareAt) return null;
  const compareAtPrice = Number(compareAt.amount);
  const currentPrice = Number(product.priceRange.minVariantPrice.amount);
  if (Number.isNaN(compareAtPrice) || Number.isNaN(currentPrice)) return null;
  if (compareAtPrice <= currentPrice) return null;
  return Math.round(((compareAtPrice - currentPrice) / compareAtPrice) * 100);
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        No products found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
      {products.map((product) => {
        const salePercentage = getSalePercentage(product);
        return (
          <Link
            className="group block space-y-3"
            href={`/products/${product.handle}`}
            key={product.id}
          >
            <div className="relative aspect-3/4 overflow-hidden bg-muted">
              {salePercentage && (
                <span className="absolute top-2 left-2 z-10 bg-red-600 px-1.5 py-0.5 text-xs font-semibold uppercase text-white">
                  Save {salePercentage}%
                </span>
              )}
              {product.featuredImage ? (
                <Image
                  alt={product.featuredImage.altText ?? product.title}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                  src={product.featuredImage.url}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                  No image
                </div>
              )}
            </div>
            <div className="space-y-1">
              <h3 className="font-normal text-sm leading-tight">
                {product.title}
              </h3>
              {product.vendor && (
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {product.vendor}
                </p>
              )}
              <p className="font-normal text-sm">
                {formatMoney(product.priceRange.minVariantPrice)}
                {salePercentage && product.compareAtPriceRange && (
                  <span className="ml-1.5 text-muted-foreground line-through">
                    {formatMoney(product.compareAtPriceRange.minVariantPrice)}
                  </span>
                )}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
