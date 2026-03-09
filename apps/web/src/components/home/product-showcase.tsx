import { Button } from "@workspace/ui/components/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { formatMoney } from "@/lib/shopify/money";
import type { FeaturedProduct } from "@/lib/shopify/types";

type ProductShowcaseProps = {
  products: FeaturedProduct[];
};

function ShowcaseCard({
  product,
  sizes,
}: {
  product: FeaturedProduct;
  sizes: string;
}) {
  return (
    <Link
      className="group relative block h-full overflow-hidden bg-neutral-900"
      href={`/products/${product.handle}`}
    >
      {product.featuredImage ? (
        <div className="absolute inset-0">
          <div className="relative h-full w-full">
            <Image
              alt={product.featuredImage.altText ?? product.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              fill
              sizes={sizes}
              src={product.featuredImage.url}
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-neutral-400 text-sm">
          No image
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 via-black/30 to-transparent p-6 pt-20">
        <h3 className="font-semibold text-base text-white md:text-lg">
          {product.title}
        </h3>
        <p className="mt-0.5 text-xs text-white/60 uppercase tracking-wider">
          {product.vendor}
        </p>
        <p className="mt-1 font-semibold text-sm text-white">
          {formatMoney(product.priceRange.minVariantPrice)}
        </p>
      </div>
    </Link>
  );
}

export function ProductShowcase({ products }: ProductShowcaseProps) {
  if (products.length < 5) return null;

  const [first, second, third, fourth, fifth] = products;

  if (!first || !second || !third || !fourth || !fifth) return null;

  return (
    <section className="container mx-auto px-4 md:px-6">
      <div className="mb-12 flex items-end justify-between md:mb-16">
        <h2 className="font-light font-(family-name:--font-geist-pixel-square) text-3xl tracking-tight md:text-4xl">
          Standout Pieces
        </h2>

        <Button
          asChild
          className="rounded-none border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-white dark:hover:text-black"
          size="lg"
        >
          <Link href="/collections/all-products">
            See all
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:gap-6">
        {/* Row 1: Full width */}
        <div className="relative aspect-video md:aspect-21/9">
          <ShowcaseCard product={first} sizes="100vw" />
        </div>

        {/* Row 2: 60/40 split */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5 md:gap-6">
          <div className="relative aspect-4/3 md:col-span-3 md:aspect-auto md:min-h-100">
            <ShowcaseCard
              product={second}
              sizes="(min-width: 768px) 60vw, 100vw"
            />
          </div>
          <div className="relative aspect-4/3 md:col-span-2 md:aspect-auto md:min-h-100">
            <ShowcaseCard
              product={third}
              sizes="(min-width: 768px) 40vw, 100vw"
            />
          </div>
        </div>

        {/* Row 3: 40/60 split (reversed) */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5 md:gap-6">
          <div className="relative aspect-4/3 md:col-span-2 md:aspect-auto md:min-h-100">
            <ShowcaseCard
              product={fourth}
              sizes="(min-width: 768px) 40vw, 100vw"
            />
          </div>
          <div className="relative aspect-4/3 md:col-span-3 md:aspect-auto md:min-h-100">
            <ShowcaseCard
              product={fifth}
              sizes="(min-width: 768px) 60vw, 100vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
