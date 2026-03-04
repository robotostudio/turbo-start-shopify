import { sanityFetch } from "@workspace/sanity/live";
import { queryHomePageData } from "@workspace/sanity/query";

import { FeaturedProducts } from "@/components/home/featured-products";
import { ProductShowcase } from "@/components/home/product-showcase";
import { PageBuilder } from "@/components/pagebuilder";
import { getSEOMetadata } from "@/lib/seo";
import { storefrontQuery } from "@/lib/shopify/client";
import { FEATURED_PRODUCTS_QUERY } from "@/lib/shopify/queries";
import type {
  FeaturedProduct,
  FeaturedProductsResponse,
} from "@/lib/shopify/types";

async function fetchHomePageData() {
  return await sanityFetch({
    query: queryHomePageData,
  });
}

async function fetchShowcaseProducts(): Promise<FeaturedProduct[]> {
  const result = await storefrontQuery<FeaturedProductsResponse>(
    FEATURED_PRODUCTS_QUERY,
    { variables: { first: 8 } }
  );
  if (!result.ok) return [];
  return result.data.products.edges.map((edge) => edge.node);
}

export async function generateMetadata() {
  const { data: homePageData } = await fetchHomePageData();
  return getSEOMetadata(
    homePageData
      ? {
          title: homePageData?.title ?? homePageData?.seoTitle ?? "",
          description:
            homePageData?.description ?? homePageData?.seoDescription ?? "",
          slug: homePageData?.slug,
          contentId: homePageData?._id,
          contentType: homePageData?._type,
        }
      : {}
  );
}

export default async function Page() {
  const [{ data: homePageData }, showcaseProducts] = await Promise.all([
    fetchHomePageData(),
    fetchShowcaseProducts(),
  ]);

  if (!homePageData) {
    return <div>No home page data</div>;
  }

  const { _id, _type, pageBuilder } = homePageData ?? {};
  const blocks = pageBuilder ?? [];

  const heroBlock = blocks.filter(
    (b: { _type: string }) => (b._type as string) === "hero"
  );
  const remainingBlocks = blocks.filter(
    (b: { _type: string }) => (b._type as string) !== "hero"
  );

  return (
    <main className="flex flex-col gap-6 md:gap-20">
      {heroBlock.length > 0 && (
        <div className="my-16 flex flex-col gap-16">
          <PageBuilder id={_id} pageBuilder={heroBlock} type={_type} />
        </div>
      )}

      <FeaturedProducts />

      {showcaseProducts.length >= 5 && (
        <ProductShowcase products={showcaseProducts.slice(0, 5)} />
      )}

      {remainingBlocks.length > 0 && (
        <PageBuilder id={_id} pageBuilder={remainingBlocks} type={_type} />
      )}
    </main>
  );
}
