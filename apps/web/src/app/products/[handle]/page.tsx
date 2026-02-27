import { client } from "@workspace/sanity/client";
import { sanityFetch } from "@workspace/sanity/live";
import {
  queryProductByHandle,
  queryProductPaths,
} from "@workspace/sanity/query";
import { notFound } from "next/navigation";

import { AddToCart } from "@/components/product/add-to-cart";
import { PriceDisplay } from "@/components/product/price-display";
import { ProductBody } from "@/components/product/product-body";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductJsonLd } from "@/components/product/product-json-ld";
import { RelatedProducts } from "@/components/product/related-products";
import { VariantSelector } from "@/components/product/variant-selector";
import { getSEOMetadata } from "@/lib/seo";
import { storefrontQuery } from "@/lib/shopify/client";
import { PRODUCT_QUERY } from "@/lib/shopify/queries";
import type {
  ProductQueryResponse,
  ShopifyImage,
  ShopifyProduct,
  ShopifyVariant,
} from "@/lib/shopify/types";
import { findVariantByOptions } from "@/lib/shopify/variant-utils";

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
    title: product.seo?.title ?? "",
    description: product.seo?.description ?? "",
    slug: `/products/${handle}`,
    contentId: product._id,
    contentType: product._type,
  });
}

function ProductImage({
  images,
  selectedVariantImageUrl,
}: {
  images: ShopifyImage[];
  selectedVariantImageUrl: string | undefined;
}) {
  if (images.length > 0) {
    return (
      <ProductGallery
        images={images}
        selectedVariantImageUrl={selectedVariantImageUrl}
      />
    );
  }

  return (
    <div className="flex aspect-3/4 items-center justify-center bg-muted text-muted-foreground">
      No image available
    </div>
  );
}

function ProductPrice({
  selectedVariant,
}: {
  selectedVariant: ShopifyVariant;
}) {
  return (
    <PriceDisplay
      compareAtPrice={selectedVariant.compareAtPrice}
      price={selectedVariant.price}
    />
  );
}

function ProductActions({
  shopifyProduct,
  handle,
  variants,
}: {
  shopifyProduct: ShopifyProduct;
  handle: string;
  variants: ShopifyVariant[];
}) {
  if (variants.length === 0) return null;

  return (
    <VariantSelector
      handle={handle}
      options={shopifyProduct.options}
      variants={variants}
    />
  );
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

  if (!sanityProduct || !shopifyResult.ok || !shopifyResult.data.product) {
    notFound();
  }

  const shopifyProduct = shopifyResult.data.product;
  const variants = shopifyProduct.variants.edges.map((e) => e.node);
  const images = shopifyProduct.images.edges.map((e) => e.node);
  const selectedVariant = findVariantByOptions(variants, sp) ?? variants[0];
  if (!selectedVariant) {
    notFound();
  }

  const title = shopifyProduct.title;
  const vendor = shopifyProduct.vendor;
  const descriptionHtml = shopifyProduct.descriptionHtml;

  return (
    <>
      <ProductJsonLd handle={handle} product={shopifyProduct} />
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductImage
            images={images}
            selectedVariantImageUrl={selectedVariant?.image?.url}
          />

          <div className="flex flex-col gap-6 md:gap-8">
            {/* Vendor + Title */}
            <div className="flex flex-col gap-6 md:gap-8">
              {vendor && (
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">
                  {vendor}
                </p>
              )}
              <h1 className="mt-2 text-4xl font-(family-name:--font-geist-pixel-square) font-light tracking-tight lg:text-5xl">
                {title}
              </h1>
            </div>

            {/* Sale badge + Price */}
            <ProductPrice selectedVariant={selectedVariant} />

            <div className="border-t border-border" />

            {/* Variant selectors */}
            <ProductActions
              handle={handle}
              shopifyProduct={shopifyProduct}
              variants={variants}
            />

            {/* Add to Cart */}
            <AddToCart
              availableForSale={selectedVariant.availableForSale}
              variantId={selectedVariant.id}
            />

            <div className="border-t border-border" />

            {/* Description from Shopify */}
            {descriptionHtml && (
              <div className="space-y-2">
                <div
                  className="prose prose-sm dark:prose-invert text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
              </div>
            )}

            {/* Details from Sanity */}
            {sanityProduct.body && (
              <div className="space-y-2">
                <h2 className="font-medium text-sm uppercase tracking-wide">
                  Details
                </h2>
                <ProductBody body={sanityProduct.body} />
              </div>
            )}
          </div>
        </div>

        <RelatedProducts
          handle={handle}
          productType={shopifyProduct.productType ?? null}
        />
      </div>
    </>
  );
}
