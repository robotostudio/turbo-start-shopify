import { Button } from "@workspace/ui/components/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { SavedItemButton } from "@/components/saved-items/saved-item-button";
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
    <div className="group relative">
      <Link className="block" href={`/products/${product.handle}`}>
        <div className="relative aspect-3/4 overflow-hidden bg-background">
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
      <SavedItemButton
        className="absolute top-2 right-2 z-10 transition-opacity md:pointer-events-none md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:opacity-100 md:focus-visible:pointer-events-auto md:focus-visible:opacity-100 md:data-[saved=true]:pointer-events-auto md:data-[saved=true]:opacity-100"
        handle={product.handle}
      />
    </div>
  );
}

export async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  if (products.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-20 md:px-6 md:py-28">
      <div className="mb-12 flex items-end justify-between md:mb-16">
        <div>
          <h2 className="font-light font-(family-name:--font-geist-pixel-square) text-3xl tracking-tight md:text-4xl">
            Featured Products
          </h2>
        </div>
        <Button
          asChild
          className="rounded-none border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-white dark:hover:text-black"
          size="lg"
        >
          <Link href="/collections/all-products">
            See all
            <ArrowRight className=" size-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="mt-10 text-center md:hidden">
        <Link
          className="border border-neutral-900 pb-0.5 text-sm"
          href="/collections"
        >
          View All
        </Link>
      </div>
    </section>
  );
}
