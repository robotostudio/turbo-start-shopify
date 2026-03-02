import { sanityFetch } from "@workspace/sanity/live";
import { queryHomePageData } from "@workspace/sanity/query";

import { CollectionBanner } from "@/components/home/collection-banner";
import { FeaturedProducts } from "@/components/home/featured-products";
import { ProductShowcase } from "@/components/home/product-showcase";
import { PageBuilder } from "@/components/pagebuilder";
import { storefrontQuery } from "@/lib/shopify/client";
import { FEATURED_PRODUCTS_QUERY } from "@/lib/shopify/queries";
import type {
  FeaturedProduct,
  FeaturedProductsResponse,
} from "@/lib/shopify/types";
import { getSEOMetadata } from "@/lib/seo";

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

  const heroBlock = blocks.filter((b: (typeof blocks)[number]) => (b._type as string) === "hero");
  const remainingBlocks = blocks.filter((b: (typeof blocks)[number]) => (b._type as string) !== "hero");

  const bannerProduct = showcaseProducts[0] ?? null;

  return (
    <main className="flex flex-col">
      {heroBlock.length > 0 && (
        <div className="mx-auto my-16 flex max-w-7xl flex-col gap-16">
          <PageBuilder id={_id} pageBuilder={heroBlock} type={_type} />
        </div>
      )}

      <FeaturedProducts />

      {showcaseProducts.length >= 3 && (
        <ProductShowcase products={showcaseProducts.slice(0, 5)} />
      )}

      <div className="py-16">
        <CollectionBanner product={bannerProduct} />
      </div>

      {remainingBlocks.length > 0 && (
        <PageBuilder id={_id} pageBuilder={remainingBlocks} type={_type} />
      )}
    </main>
  );
}
