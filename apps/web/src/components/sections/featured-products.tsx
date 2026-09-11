import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

import { ProductCard } from "@/components/product/product-card";
import { collectionProductToCardProps } from "@/lib/shopify/product-card";
import type { FeaturedProduct } from "@/lib/shopify/types";

type FeaturedProductsProps = {
  heading?: string | null;
  products: FeaturedProduct[];
};

export function FeaturedProducts({ heading, products }: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="site-container py-12 md:py-20">
      <div className="mb-8 flex items-end justify-between">
        <h2
          className="font-medium text-3xl tracking-tight md:text-4xl"
          data-inline-edit
        >
          {heading || "Featured Products"}
        </h2>
        <Button asChild size="sm" variant="default">
          <Link href="/collections/all-products">Shop All</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-1 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            {...collectionProductToCardProps(product)}
          />
        ))}
      </div>
    </section>
  );
}
