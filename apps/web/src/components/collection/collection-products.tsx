"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { CollectionPagination } from "@/components/collection/collection-pagination";
import { ProductGrid } from "@/components/collection/product-grid";
import type { ShopifyCollectionProduct } from "@/lib/shopify/types";

type PageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};

type CollectionPage = {
  products: ShopifyCollectionProduct[];
  pageInfo: PageInfo;
};

type CollectionProductsProps = {
  handle: string;
  initialPageInfo: PageInfo;
  initialProducts: ShopifyCollectionProduct[];
  reverse: boolean;
  sort: string;
};

export function CollectionProducts({
  handle,
  initialPageInfo,
  initialProducts,
  reverse,
  sort,
}: CollectionProductsProps) {
  const searchParams = useSearchParams();

  // Extract filter params to include in query key and API calls
  const filterEntries: [string, string][] = [];
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith("filter.")) {
      filterEntries.push([key, value]);
    }
  }
  const filterKey = JSON.stringify(filterEntries);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<CollectionPage>({
      queryKey: ["collection-products", handle, sort, reverse, filterKey],
      queryFn: async ({ pageParam }) => {
        const params = new URLSearchParams({
          sort,
          reverse: String(reverse),
        });
        if (pageParam) params.set("after", pageParam as string);

        // Forward filter params to the API route
        for (const [key, value] of filterEntries) {
          params.append(key, value);
        }

        const res = await fetch(
          `/api/collections/${handle}/products?${params.toString()}`
        );
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json() as Promise<CollectionPage>;
      },
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) =>
        lastPage.pageInfo.hasNextPage ? lastPage.pageInfo.endCursor : undefined,
      initialData: {
        pages: [{ products: initialProducts, pageInfo: initialPageInfo }],
        pageParams: [null],
      },
    });

  const allProducts = data?.pages.flatMap((page) => page.products) ?? [];

  return (
    <>
      <p className="mb-6 text-muted-foreground text-sm">
        Showing {allProducts.length} product
        {allProducts.length !== 1 ? "s" : ""}
      </p>
      <ProductGrid products={allProducts} />
      <CollectionPagination
        hasNextPage={hasNextPage}
        isLoading={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
      />
    </>
  );
}
