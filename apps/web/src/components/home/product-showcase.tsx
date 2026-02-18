import Image from "next/image";
import Link from "next/link";

import { formatMoney } from "@/lib/shopify/money";
import type { FeaturedProduct } from "@/lib/shopify/types";

type ProductShowcaseProps = {
  products: FeaturedProduct[];
};

function ShowcaseCard({
  product,
  large,
}: {
  product: FeaturedProduct;
  large?: boolean;
}) {
  return (
    <Link
      className="group relative block overflow-hidden rounded-sm bg-neutral-100"
      href={`/products/${product.handle}`}
    >
      <div className={large ? "aspect-[3/4] md:aspect-[2/3]" : "aspect-[4/3]"}>
        {product.featuredImage ? (
          <Image
            alt={product.featuredImage.altText ?? product.title}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            fill
            sizes={
              large
                ? "(min-width: 768px) 60vw, 100vw"
                : "(min-width: 768px) 35vw, 100vw"
            }
            src={product.featuredImage.url}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400 text-sm">
            No image
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-6">
        <h3
          className={`font-light text-white ${large ? "text-xl md:text-2xl" : "text-base"}`}
        >
          {product.title}
        </h3>
        <p className="mt-1 text-sm text-white/80">
          {formatMoney(product.priceRange.minVariantPrice)}
        </p>
      </div>
    </Link>
  );
}

export function ProductShowcase({ products }: ProductShowcaseProps) {
  if (products.length < 3) return null;

  const featured = products[0];
  const secondary = products.slice(1, 3);

  if (!featured) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6">
      <div className="mb-12 md:mb-16">
        <p className="mb-2 text-neutral-500 text-xs tracking-widest uppercase">
          Editor&apos;s Picks
        </p>
        <h2 className="font-light text-3xl tracking-tight md:text-4xl">
          Standout Pieces
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-5 md:gap-6">
        <div className="md:col-span-3">
          <ShowcaseCard large product={featured} />
        </div>
        <div className="grid gap-4 md:col-span-2 md:gap-6">
          {secondary.map((product) => (
            <ShowcaseCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
