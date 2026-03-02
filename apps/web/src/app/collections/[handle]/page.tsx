import { client } from "@workspace/sanity/client";
import { sanityFetch } from "@workspace/sanity/live";
import {
  queryCollectionByHandle,
  queryCollectionPaths,
} from "@workspace/sanity/query";
import { notFound } from "next/navigation";

import { CollectionModuleRenderer } from "@/components/collection/collection-module";
import { CollectionProducts } from "@/components/collection/collection-products";
import { SortSelector } from "@/components/collection/sort-selector";
import { parseSortParams } from "@/components/collection/sort-utils";
import { getSEOMetadata } from "@/lib/seo";
import { storefrontQuery } from "@/lib/shopify/client";
import { COLLECTION_QUERY } from "@/lib/shopify/queries";
import type { CollectionQueryResponse } from "@/lib/shopify/types";

type PageProps = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<Record<string, string>>;
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
    title: collection.seo?.title ?? "",
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

  const [{ data: sanityCollection }, shopifyResult] = await Promise.all([
    sanityFetch({
      query: queryCollectionByHandle,
      params: { handle },
    }),
    storefrontQuery<CollectionQueryResponse>(COLLECTION_QUERY, {
      variables: { handle, first: 12, after: null, sortKey: sort, reverse },
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-semibold text-3xl">{shopifyCollection.title}</h1>

        {shopifyCollection.description && (
          <p className="mt-2 text-muted-foreground">
            {shopifyCollection.description}
          </p>
        )}
      </div>

      <div className="mb-6 flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {products.length} product{products.length !== 1 ? "s" : ""}
        </p>
        <SortSelector currentReverse={reverse} currentSort={sort} />
      </div>

      <CollectionProducts
        handle={handle}
        initialPageInfo={shopifyCollection.products.pageInfo}
        initialProducts={products}
        key={`${sort}-${reverse}`}
        reverse={reverse}
        sort={sort}
      />

      {sanityCollection.modules && sanityCollection.modules.length > 0 && (
        <div className="mt-12">
          {sanityCollection.modules.map((module) => (
            <CollectionModuleRenderer key={module._key} module={module} />
          ))}
        </div>
      )}
    </div>
  );
}
