import { NextResponse } from "next/server";

import { storefrontQuery } from "@/lib/shopify/client";
import { PRODUCT_BY_HANDLE_QUERY } from "@/lib/shopify/queries";
import type { ProductByHandleResponse } from "@/lib/shopify/types";

const HANDLE_PATTERN = /^[a-z0-9-]+$/;
const MAX_HANDLES = 50;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handles = searchParams.get("handles");

  if (!handles) {
    return NextResponse.json({ products: [] });
  }

  const handleList = handles
    .split(",")
    .filter((h) => h && HANDLE_PATTERN.test(h))
    .slice(0, MAX_HANDLES);

  if (handleList.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const results = await Promise.all(
    handleList.map((handle) =>
      storefrontQuery<ProductByHandleResponse>(PRODUCT_BY_HANDLE_QUERY, {
        variables: { handle },
      })
    )
  );

  const products = results
    .filter((r) => r.ok && r.data.product)
    .map((r) => (r as { ok: true; data: ProductByHandleResponse }).data.product)
    .filter(Boolean);

  return NextResponse.json({ products });
}
