import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { SanityButtonProps } from "@/types";

type Collection = {
  _id: string;
  title: string | null;
  slug: string | null;
  imageUrl: string | null;
};

type ExploreCategoriesProps = {
  _key: string;
  _type: "exploreCategories";
  title?: string | null;
  buttons?: SanityButtonProps[] | null;
  collections?: Collection[] | null;
};

function CategoryCard({ collection }: { collection: Collection }) {
  return (
    <Link
      className="group block"
      href={`/collections/${collection.slug ?? ""}`}
    >
      <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {collection.imageUrl ? (
          <Image
            alt={collection.title ?? "Collection"}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            src={collection.imageUrl}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
      </div>
      <p className="mt-3 text-sm font-medium md:text-base">
        {collection.title}
      </p>
    </Link>
  );
}

export function ExploreCategories({
  title,
  buttons,
  collections,
}: ExploreCategoriesProps) {
  if (!collections || collections.length === 0) return null;

  return (
    <section className="container mx-auto px-4 md:px-6">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-normal font-(family-name:--font-geist-pixel-square) text-3xl tracking-tight md:text-4xl">
          {title}
        </h2>
        {buttons?.map((button) =>
          button.href ? (
            <Link
              key={button._key}
              className="flex items-center gap-2 border border-current px-6 py-2.5 text-sm uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background"
              href={button.href}
              target={button.openInNewTab ? "_blank" : "_self"}
            >
              {button.text ?? "See all"}
              <ArrowRight className="size-4" />
            </Link>
          ) : null
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {collections.map((collection) => (
          <CategoryCard collection={collection} key={collection._id} />
        ))}
      </div>
    </section>
  );
}
