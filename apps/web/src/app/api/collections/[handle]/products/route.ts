import { type NextRequest, NextResponse } from "next/server";

import { parseFilterParams } from "@/components/collection/filter-utils";
import { storefrontQuery } from "@/lib/shopify/client";
import { COLLECTION_QUERY } from "@/lib/shopify/queries";
import type { CollectionQueryResponse } from "@/lib/shopify/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const sp = request.nextUrl.searchParams;

  const after = sp.get("after");
  const sort = sp.get("sort") ?? "COLLECTION_DEFAULT";
  const reverse = sp.get("reverse") === "true";
  const first = Number(sp.get("first") ?? 12);
  const filters = parseFilterParams(sp);

  const result = await storefrontQuery<CollectionQueryResponse>(
    COLLECTION_QUERY,
    {
      variables: {
        handle,
        first,
        after,
        sortKey: sort,
        reverse,
        filters: filters.length > 0 ? filters : undefined,
      },
    }
  );

  if (!result.ok || !result.data.collection) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }

  const { products } = result.data.collection;

  return NextResponse.json({
    products: products.edges.map((e) => e.node),
    pageInfo: products.pageInfo,
  });
}
