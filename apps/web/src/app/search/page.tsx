import { Suspense } from "react";

import { ProductGrid } from "@/components/collection/product-grid";
import { SearchInput } from "@/components/search/search-input";
import { getSEOMetadata } from "@/lib/seo";
import { storefrontQuery } from "@/lib/shopify/client";
import { SEARCH_PRODUCTS_QUERY } from "@/lib/shopify/queries";
import type { SearchProductsResponse } from "@/lib/shopify/types";

export function generateMetadata() {
  return getSEOMetadata({
    title: "Search",
    description: "Search our products",
    slug: "/search",
    seoNoIndex: true,
  });
}

type PageProps = {
  searchParams: Promise<Record<string, string>>;
};

async function SearchResults({ query }: { query: string }) {
  const result = await storefrontQuery<SearchProductsResponse>(
    SEARCH_PRODUCTS_QUERY,
    { variables: { query, first: 24 } }
  );

  if (!result.ok) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        Something went wrong. Please try again.
      </p>
    );
  }

  const products = result.data.search.edges.map((e) => e.node);
  const totalCount = result.data.search.totalCount;

  return (
    <div>
      <p className="mb-6 text-muted-foreground text-sm">
        {totalCount} result{totalCount !== 1 ? "s" : ""} for &ldquo;{query}
        &rdquo;
      </p>
      <ProductGrid products={products} />
    </div>
  );
}

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const query = sp.q?.trim() ?? "";

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="mb-8 font-semibold text-3xl">Search</h1>
      <div className="mb-8 max-w-lg">
        <Suspense>
          <SearchInput />
        </Suspense>
      </div>
      {query ? (
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-16">
              <div className="size-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            </div>
          }
        >
          <SearchResults query={query} />
        </Suspense>
      ) : (
        <p className="py-8 text-center text-muted-foreground">
          Enter a search term to find products.
        </p>
      )}
    </div>
  );
}
