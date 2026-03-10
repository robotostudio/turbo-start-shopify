import Image from "next/image";
import Link from "next/link";

import { SavedItemButton } from "@/components/saved-items/saved-item-button";
import { formatMoney } from "@/lib/shopify/money";
import {
  LOW_STOCK_THRESHOLD,
  type ShopifyCollectionProduct,
} from "@/lib/shopify/types";

type StockStatus = "low" | "out" | null;

function getStockStatus(product: ShopifyCollectionProduct): StockStatus {
  const variant = product.variants.edges[0]?.node;
  if (!variant?.availableForSale) return "out";
  if (
    variant.quantityAvailable !== null &&
    variant.quantityAvailable > 0 &&
    variant.quantityAvailable <= LOW_STOCK_THRESHOLD
  ) {
    return "low";
  }
  return null;
}

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
        const stockStatus = getStockStatus(product);
        const salePercentage = getSalePercentage(product);
        return (
          <div className="group relative" key={product.id}>
            <Link
              className="block space-y-3"
              href={`/products/${product.handle}`}
            >
              <div className="relative aspect-3/4 overflow-hidden bg-muted">
                {salePercentage && (
                  <span className="absolute top-2 left-2 z-10 bg-red-600 px-1.5 py-0.5 text-xs font-semibold uppercase text-white">
                    Save {salePercentage}%
                  </span>
                )}
                {stockStatus === "low" && (
                  <span className="absolute bottom-2 right-2 z-10 bg-amber-600 px-1.5 py-0.5 text-xs font-semibold uppercase text-white">
                    Low Stock
                  </span>
                )}
                {stockStatus === "out" && (
                  <span className="absolute bottom-2 right-2 z-10 bg-zinc-800 px-1.5 py-0.5 text-xs font-semibold uppercase text-white">
                    Sold Out
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
            <SavedItemButton
              className="absolute top-2 right-2 z-10 transition-opacity md:pointer-events-none md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:opacity-100 md:focus-visible:pointer-events-auto md:focus-visible:opacity-100 md:data-[saved=true]:pointer-events-auto md:data-[saved=true]:opacity-100"
              handle={product.handle}
            />
          </div>
        );
      })}
    </div>
  );
}
