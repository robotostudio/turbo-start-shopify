import { NextResponse } from "next/server";

import { storefrontQuery } from "@/lib/shopify/client";
import { PRODUCTS_BY_HANDLES_QUERY } from "@/lib/shopify/queries";
import type { ProductsByHandlesResponse } from "@/lib/shopify/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handles = searchParams.get("handles");

  if (!handles) {
    return NextResponse.json({ products: [] });
  }

  const HANDLE_PATTERN = /^[a-z0-9-]+$/;
  const MAX_HANDLES = 50;

  const handleList = handles
    .split(",")
    .filter((h) => h && HANDLE_PATTERN.test(h))
    .slice(0, MAX_HANDLES);

  if (handleList.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const query = handleList.map((h) => `handle:${h}`).join(" OR ");

  const result = await storefrontQuery<ProductsByHandlesResponse>(
    PRODUCTS_BY_HANDLES_QUERY,
    { variables: { query, first: handleList.length } }
  );

  if (!result.ok) {
    return NextResponse.json({ products: [] }, { status: 500 });
  }

  const products = result.data.products.edges.map((e) => e.node);
  return NextResponse.json({ products });
}
