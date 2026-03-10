"use client";

import type { QueryAllCollectionsResult } from "@workspace/sanity/types";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { CollectionCard } from "@/components/collection/collection-card";
import {
  CollectionsSortSelector,
  type SortOption,
  sortCollections,
} from "@/components/collections/collections-sort";

type CollectionsContentProps = {
  title: string;
  subtitle: string | null;
  collections: QueryAllCollectionsResult;
};

function CollectionsGrid({
  title,
  subtitle,
  collections,
}: CollectionsContentProps) {
  const searchParams = useSearchParams();
  const sort = (searchParams.get("sort") as SortOption) || "a-z";
  const sorted = sortCollections(collections, sort);

  return (
    <div className="container mx-auto  px-4 py-12">
      <div className="mb-8 flex items-center md:items-end justify-between gap-4">
        <div className="w-6/12 md:max-w-2xl">
          <h2 className="font-semibold font-(family-name:--font-geist-pixel-square) text-3xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <CollectionsSortSelector />
      </div>
      {sorted.length === 0 ? (
        <p className="text-muted-foreground">No collections found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
          {sorted.map((collection) => (
            <CollectionCard
              description={collection.description}
              handle={collection.slug ?? ""}
              imageUrl={collection.imageUrl ?? null}
              key={collection._id}
              title={collection.title ?? "Untitled"}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CollectionsContent(props: CollectionsContentProps) {
  return (
    <Suspense>
      <CollectionsGrid {...props} />
    </Suspense>
  );
}
