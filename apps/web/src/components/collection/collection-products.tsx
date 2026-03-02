"use client";

import { useCallback, useState } from "react";

import { CollectionPagination } from "@/components/collection/collection-pagination";
import { ProductGrid } from "@/components/collection/product-grid";
import type { ShopifyCollectionProduct } from "@/lib/shopify/types";

type PageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
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
  const [products, setProducts] =
    useState<ShopifyCollectionProduct[]>(initialProducts);
  const [pageInfo, setPageInfo] = useState<PageInfo>(initialPageInfo);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (!pageInfo.endCursor || isLoading) return;

    setIsLoading(true);

    const params = new URLSearchParams({
      after: pageInfo.endCursor,
      sort,
      reverse: String(reverse),
    });

    try {
      const res = await fetch(
        `/api/collections/${handle}/products?${params.toString()}`
      );

      if (!res.ok) return;

      const data = (await res.json()) as {
        products: ShopifyCollectionProduct[];
        pageInfo: PageInfo;
      };

      setProducts((prev) => [...prev, ...data.products]);
      setPageInfo(data.pageInfo);
    } finally {
      setIsLoading(false);
    }
  }, [pageInfo.endCursor, isLoading, sort, reverse, handle]);

  return (
    <>
      <ProductGrid products={products} />
      <CollectionPagination
        hasNextPage={pageInfo.hasNextPage}
        isLoading={isLoading}
        onLoadMore={loadMore}
      />
    </>
  );
}
