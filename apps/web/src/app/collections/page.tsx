import { sanityFetch } from "@workspace/sanity/live";
import {
  queryAllCollections,
  queryCollectionsIndexPageData,
} from "@workspace/sanity/query";

import { CollectionsContent } from "@/components/collections/collections-content";
import { CollectionsHero } from "@/components/collections/collections-hero";
import { getSEOMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const { data } = await sanityFetch({
    query: queryCollectionsIndexPageData,
  });

  return getSEOMetadata({
    title: data?.seoTitle ?? data?.title ?? "Collections",
    description:
      data?.seoDescription ?? data?.subtitle ?? "Browse all collections",
    slug: "/collections",
  });
}

export default async function CollectionsPage() {
  const [{ data: indexData }, { data: collections }] = await Promise.all([
    sanityFetch({ query: queryCollectionsIndexPageData }),
    sanityFetch({ query: queryAllCollections }),
  ]);

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <CollectionsHero
        buttons={indexData?.buttons ?? null}
        heroImage={indexData?.heroImage ?? null}
        heroTitle={indexData?.heroTitle ?? null}
      />
      <CollectionsContent
        collections={collections ?? []}
        subtitle={indexData?.subtitle ?? null}
        title={indexData?.title ?? "Collections"}
      />
    </div>
  );
}
