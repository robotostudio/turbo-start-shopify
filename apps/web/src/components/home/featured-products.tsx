import Image from "next/image";
import Link from "next/link";

import { storefrontQuery } from "@/lib/shopify/client";
import { formatMoney } from "@/lib/shopify/money";
import { FEATURED_PRODUCTS_QUERY } from "@/lib/shopify/queries";
import type {
  FeaturedProduct,
  FeaturedProductsResponse,
} from "@/lib/shopify/types";

/** Fetches featured products from Shopify Storefront API. */
async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  const result = await storefrontQuery<FeaturedProductsResponse>(
    FEATURED_PRODUCTS_QUERY,
    { variables: { first: 8 } }
  );

  if (!result.ok) return [];
  return result.data.products.edges.map((edge) => edge.node);
}

function ProductCard({ product }: { product: FeaturedProduct }) {
  return (
    <Link className="group block" href={`/products/${product.handle}`}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-neutral-100">
        {product.featuredImage ? (
          <Image
            alt={product.featuredImage.altText ?? product.title}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            src={product.featuredImage.url}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400 text-sm">
            No image
          </div>
        )}
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="font-normal text-sm tracking-wide">{product.title}</h3>
        {product.vendor && (
          <p className="text-neutral-500 text-xs tracking-wider uppercase">
            {product.vendor}
          </p>
        )}
        <p className="text-sm">
          {formatMoney(product.priceRange.minVariantPrice)}
        </p>
      </div>
    </Link>
  );
}

export async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28">
      <div className="mb-12 flex items-end justify-between md:mb-16">
        <div>
          <p className="mb-2 text-neutral-500 text-xs tracking-widest uppercase">
            The Collection
          </p>
          <h2 className="font-light text-3xl tracking-tight md:text-4xl">
            Featured Products
          </h2>
        </div>
        <Link
          className="hidden border-b border-neutral-900 pb-0.5 text-sm transition-colors hover:border-neutral-400 hover:text-neutral-600 md:block"
          href="/collections/frontpage"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="mt-10 text-center md:hidden">
        <Link
          className="border-b border-neutral-900 pb-0.5 text-sm"
          href="/collections/frontpage"
        >
          View All
        </Link>
      </div>
    </section>
  );
}
