import Image from "next/image";
import Link from "next/link";

import { SavedItemButton } from "@/components/saved-items/saved-item-button";
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
        <div className="group relative" key={product.id}>
          <Link
            className="block space-y-3"
            href={`/products/${product.handle}`}
          >
            <div className="relative aspect-3/4 overflow-hidden bg-muted">
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
              </p>
            </div>
          </Link>
          <SavedItemButton
            className="absolute top-2 right-2 z-10 md:opacity-0 md:group-hover:opacity-100 md:data-[saved=true]:opacity-100 transition-opacity"
            handle={product.handle}
          />
        </div>
      ))}
    </div>
  );
}
