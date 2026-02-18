import { notFound } from "next/navigation";

import { client } from "@workspace/sanity/client";
import { sanityFetch } from "@workspace/sanity/live";
import {
  queryProductByHandle,
  queryProductPaths,
} from "@workspace/sanity/query";

import { AddToCart } from "@/components/product/add-to-cart";
import { PriceDisplay } from "@/components/product/price-display";
import { ProductBody } from "@/components/product/product-body";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductJsonLd } from "@/components/product/product-json-ld";
import { RelatedProducts } from "@/components/product/related-products";
import { VariantSelector } from "@/components/product/variant-selector";
import { storefrontQuery } from "@/lib/shopify/client";
import { PRODUCT_QUERY } from "@/lib/shopify/queries";
import type { ProductQueryResponse } from "@/lib/shopify/types";
import { findVariantByOptions } from "@/lib/shopify/variant-utils";
import { getSEOMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<Record<string, string>>;
};

export async function generateStaticParams() {
  const paths = await client.fetch(queryProductPaths);
  return (paths ?? [])
    .filter((handle): handle is string => handle !== null)
    .map((handle) => ({ handle }));
}

export async function generateMetadata({ params }: PageProps) {
  const { handle } = await params;
  const { data: product } = await sanityFetch({
    query: queryProductByHandle,
    params: { handle },
  });

  if (!product) return {};

  return getSEOMetadata({
    title: product.seo?.title ?? product.store?.title ?? "",
    description: product.seo?.description ?? "",
    slug: `/products/${handle}`,
    contentId: product._id,
    contentType: product._type,
  });
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { handle } = await params;
  const sp = await searchParams;

  const [{ data: sanityProduct }, shopifyResult] = await Promise.all([
    sanityFetch({
      query: queryProductByHandle,
      params: { handle },
    }),
    storefrontQuery<ProductQueryResponse>(PRODUCT_QUERY, {
      variables: { handle },
    }),
  ]);

  if (!sanityProduct || !shopifyResult.ok) {
    notFound();
  }

  const shopifyProduct = shopifyResult.data.product;
  const variants = shopifyProduct.variants.edges.map((e) => e.node);
  const images = shopifyProduct.images.edges.map((e) => e.node);

  const selectedVariant = findVariantByOptions(variants, sp) ?? variants[0];

  if (!selectedVariant) {
    notFound();
  }

  return (
    <>
      <ProductJsonLd handle={handle} product={shopifyProduct} />
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <ProductGallery
            images={images}
            selectedVariantImageUrl={selectedVariant.image?.url}
          />

          <div className="flex flex-col gap-6">
            <div>
              <h1 className="font-semibold text-3xl">{shopifyProduct.title}</h1>
              {shopifyProduct.vendor && (
                <p className="mt-1 text-muted-foreground">
                  {shopifyProduct.vendor}
                </p>
              )}
            </div>

            <PriceDisplay
              compareAtPrice={selectedVariant.compareAtPrice}
              price={selectedVariant.price}
            />

            <VariantSelector
              handle={handle}
              options={shopifyProduct.options}
              variants={variants}
            />

            <AddToCart
              availableForSale={selectedVariant.availableForSale}
              variantId={selectedVariant.id}
            />

            {sanityProduct.body && <ProductBody body={sanityProduct.body} />}
          </div>
        </div>

        <RelatedProducts
          handle={handle}
          productType={sanityProduct.store?.productType ?? null}
        />
      </div>
    </>
  );
}
