import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { CollectionCard } from "@/components/collection/collection-card";
import { sanityCollectionToCardProps } from "@/lib/collection-card";
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

export function ExploreCategories({
  title,
  buttons,
  collections,
}: ExploreCategoriesProps) {
  if (!collections || collections.length === 0) return null;

  return (
    <section className="site-container py-12 md:py-20">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <h2
          className="font-normal text-3xl tracking-tight md:text-4xl"
          data-inline-edit
        >
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
      <div className="grid grid-cols-2 gap-x-1 gap-y-4 md:grid-cols-4 md:gap-y-6">
        {collections.map((collection) => (
          <CollectionCard
            key={collection._id}
            {...sanityCollectionToCardProps(collection)}
          />
        ))}
      </div>
    </section>
  );
}
