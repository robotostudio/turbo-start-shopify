import Image from "next/image";
import Link from "next/link";

import { formatMoney } from "@/lib/shopify/money";
import type { ShopifyCollectionProduct } from "@/lib/shopify/types";

type ProductGridProps = {
  products: ShopifyCollectionProduct[];
};

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
      {products.map((product) => (
        <Link
          className="group block space-y-3"
          href={`/products/${product.handle}`}
          key={product.id}
        >
          <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
            {product.featuredImage ? (
              <Image
                alt={product.featuredImage.altText ?? product.title}
                className="object-cover transition-transform duration-300 group-hover:scale-105"
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
            <h3 className="font-medium text-sm leading-tight group-hover:underline">
              {product.title}
            </h3>
            {product.vendor && (
              <p className="text-muted-foreground text-xs">{product.vendor}</p>
            )}
            <p className="font-medium text-sm">
              {formatMoney(product.priceRange.minVariantPrice)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
