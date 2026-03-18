import { client } from "@workspace/sanity/client";
import { sanityFetch } from "@workspace/sanity/live";
import {
  queryCollectionByHandle,
  queryCollectionPaths,
} from "@workspace/sanity/query";
import type { QueryCollectionByHandleResult } from "@workspace/sanity/types";
import { notFound } from "next/navigation";

import { ActiveFilters } from "@/components/collection/active-filters";
import {
  CollectionLayout,
  FilterToggle,
  FilterVisibilityProvider,
} from "@/components/collection/collection-layout";
import { CollectionModuleRenderer } from "@/components/collection/collection-module";
import { CollectionProducts } from "@/components/collection/collection-products";
import { FilterDrawer } from "@/components/collection/filter-drawer";
import { parseFilterParams } from "@/components/collection/filter-utils";
import { SortSelector } from "@/components/collection/sort-selector";
import { parseSortParams } from "@/components/collection/sort-utils";
import { getSEOMetadata } from "@/lib/seo";
import { storefrontQuery } from "@/lib/shopify/client";
import { COLLECTION_QUERY } from "@/lib/shopify/queries";
import type { CollectionQueryResponse } from "@/lib/shopify/types";

type PageProps = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<Record<string, string | string[]>>;
};

export async function generateStaticParams() {
  const paths = await client.fetch(queryCollectionPaths);
  return (paths ?? [])
    .filter((handle): handle is string => handle !== null)
    .map((handle) => ({ handle }));
}

export async function generateMetadata({ params }: PageProps) {
  const { handle } = await params;
  const { data: collection } = await sanityFetch({
    query: queryCollectionByHandle,
    params: { handle },
  });

  if (!collection) return {};

  return getSEOMetadata({
    title: collection.seo?.title || collection.title || "",
    description: collection.seo?.description ?? "",
    slug: `/collections/${handle}`,
    contentId: collection._id,
    contentType: collection._type,
  });
}

export default async function CollectionPage({
  params,
  searchParams,
}: PageProps) {
  const { handle } = await params;
  const sp = await searchParams;
  const { sort, reverse } = parseSortParams(sp);

  // Build URLSearchParams that correctly handles multi-value params
  // (Next.js searchParams returns string[] for duplicate keys)
  const urlParams = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        urlParams.append(key, v);
      }
    } else {
      urlParams.append(key, value);
    }
  }
  const filters = parseFilterParams(urlParams);

  const [{ data: sanityCollection }, shopifyResult] = await Promise.all([
    sanityFetch({
      query: queryCollectionByHandle,
      params: { handle },
    }),
    storefrontQuery<CollectionQueryResponse>(COLLECTION_QUERY, {
      variables: {
        handle,
        first: 12,
        after: null,
        sortKey: sort,
        reverse,
        filters: filters.length > 0 ? filters : undefined,
      },
    }),
  ]);

  if (
    !sanityCollection ||
    !shopifyResult.ok ||
    !shopifyResult.data.collection
  ) {
    notFound();
  }

  const shopifyCollection = shopifyResult.data.collection;
  const products = shopifyCollection.products.edges.map((e) => e.node);
  const availableFilters = shopifyCollection.products.filters ?? [];

  // Build a stable key that includes filters so components re-mount on filter change
  const filterKey = JSON.stringify(filters);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-normal font-(family-name:--font-geist-pixel-square) text-3xl md:text-4xl">
          {shopifyCollection.title}
        </h1>

        {shopifyCollection.description && (
          <p className="mt-2 text-muted-foreground">
            {shopifyCollection.description}
          </p>
        )}
      </div>

      <FilterVisibilityProvider>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FilterDrawer filters={availableFilters} />
            <FilterToggle />
          </div>
          <SortSelector currentReverse={reverse} currentSort={sort} />
        </div>

        <ActiveFilters />

        <CollectionLayout filters={availableFilters}>
          <CollectionProducts
            handle={handle}
            initialPageInfo={shopifyCollection.products.pageInfo}
            initialProducts={products}
            key={`${sort}-${reverse}-${filterKey}`}
            reverse={reverse}
            sort={sort}
          />
        </CollectionLayout>
      </FilterVisibilityProvider>

      {sanityCollection.modules && sanityCollection.modules.length > 0 && (
        <div className="mt-12">
          {sanityCollection.modules.map(
            (
              module: NonNullable<
                NonNullable<QueryCollectionByHandleResult>["modules"]
              >[number]
            ) => (
              <CollectionModuleRenderer key={module._key} module={module} />
            )
          )}
        </div>
      )}
    </div>
  );
}
