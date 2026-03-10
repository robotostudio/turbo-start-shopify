"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { Heart, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useCart } from "@/components/cart/cart-context";
import { SavedItemButton } from "@/components/saved-items/saved-item-button";
import { useSavedItems } from "@/components/saved-items/saved-items-context";
import { formatMoney } from "@/lib/shopify/money";
import type { ShopifyCollectionProduct } from "@/lib/shopify/types";

type SavedProductsResponse = {
  products: ShopifyCollectionProduct[];
};

async function fetchSavedProducts(
  handles: string[]
): Promise<ShopifyCollectionProduct[]> {
  if (handles.length === 0) return [];
  const response = await fetch(`/api/saved-items?handles=${handles.join(",")}`);
  if (!response.ok) return [];
  const data: SavedProductsResponse = await response.json();
  return data.products;
}

function SavedProductCard({ product }: { product: ShopifyCollectionProduct }) {
  const { addLine, openCart } = useCart();
  const firstVariant = product.variants.edges[0]?.node;

  return (
    <div className="group relative">
      <Link className="block space-y-3" href={`/products/${product.handle}`}>
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
          <h3 className="font-normal text-sm leading-tight">{product.title}</h3>
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
        className="absolute top-2 right-2 z-10"
        handle={product.handle}
      />
      {firstVariant?.availableForSale && (
        <Button
          className="mt-3 w-full rounded-none uppercase"
          onClick={async (e) => {
            e.preventDefault();
            await addLine(firstVariant.id, 1);
            openCart();
          }}
          size="lg"
          variant="outline"
        >
          <ShoppingBag className="mr-2 size-4" />
          Add to Bag
        </Button>
      )}
    </div>
  );
}

export default function SavedPage() {
  const { items, count } = useSavedItems();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["saved-items", [...items].sort().join(",")],
    queryFn: () => fetchSavedProducts(items),
    enabled: items.length > 0,
  });

  if (isLoading && count > 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="mb-8 font-semibold text-3xl">Saved Items</h1>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {Array.from({ length: count }).map((_, i) => (
            <div className="space-y-3" key={`skeleton-${i.toString()}`}>
              <div className="aspect-3/4 animate-pulse bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="mb-8 font-semibold text-3xl">Saved Items</h1>
        <div className="flex flex-col items-center justify-center gap-6 py-16">
          <Heart className="size-16 text-muted-foreground" />
          <div className="text-center">
            <p className="font-medium text-lg">No saved items yet</p>
            <p className="mt-1 text-muted-foreground text-sm">
              Tap the heart icon on any product to save it for later.
            </p>
          </div>
          <Button asChild>
            <Link href="/collections">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Sort products to match the order of items in localStorage
  const sortedProducts = items
    .map((handle) => products.find((p) => p.handle === handle))
    .filter((p): p is ShopifyCollectionProduct => p !== undefined);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-semibold text-3xl">Saved Items</h1>
        <p className="text-muted-foreground text-sm">
          {count} {count === 1 ? "item" : "items"}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {sortedProducts.map((product) => (
          <SavedProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
