import Image from "next/image";
import Link from "next/link";

import type { FeaturedProduct } from "@/lib/shopify/types";

type CollectionBannerProps = {
  product: FeaturedProduct | null;
};

export function CollectionBanner({ product }: CollectionBannerProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6">
      <div className="relative overflow-hidden rounded-sm bg-neutral-900 text-white">
        {product?.featuredImage && (
          <Image
            alt={product.featuredImage.altText ?? "Collection"}
            className="object-cover opacity-40"
            fill
            sizes="100vw"
            src={product.featuredImage.url}
          />
        )}

        <div className="relative flex flex-col items-center justify-center px-6 py-24 text-center md:py-36">
          <p className="mb-4 text-white/60 text-xs tracking-widest uppercase">
            Explore the Range
          </p>
          <h2 className="max-w-lg font-light text-3xl tracking-tight md:text-5xl">
            Curated for Modern Living
          </h2>
          <p className="mt-4 max-w-md text-white/70 text-sm leading-relaxed md:text-base">
            Thoughtfully designed pieces that bring warmth and character to
            every room.
          </p>
          <Link
            className="mt-10 border border-white px-8 py-3 text-sm tracking-wider uppercase transition-colors hover:bg-white hover:text-neutral-900"
            href="/collections/frontpage"
          >
            Shop Collection
          </Link>
        </div>
      </div>
    </section>
  );
}
