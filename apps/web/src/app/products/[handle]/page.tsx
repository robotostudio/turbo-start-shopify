import Image from "next/image";
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
import { resolveGids } from "@/lib/shopify/gid";
import { PRODUCT_QUERY } from "@/lib/shopify/queries";
import type {
  ProductQueryResponse,
  ShopifyImage,
  ShopifyProduct,
  ShopifyVariant,
} from "@/lib/shopify/types";
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

function ProductImage({
  images,
  selectedVariantImageUrl,
  fallbackUrl,
  fallbackAlt,
}: {
  images: ShopifyImage[];
  selectedVariantImageUrl: string | undefined;
  fallbackUrl: string | null | undefined;
  fallbackAlt: string;
}) {
  if (images.length > 0) {
    return (
      <ProductGallery
        images={images}
        selectedVariantImageUrl={selectedVariantImageUrl}
      />
    );
  }

  if (fallbackUrl) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
        <Image
          alt={fallbackAlt}
          className="size-full object-cover"
          fill
          src={fallbackUrl}
        />
      </div>
    );
  }

  return (
    <div className="flex aspect-square items-center justify-center rounded-xl border bg-muted text-muted-foreground">
      No image available
    </div>
  );
}

function ProductPrice({
  selectedVariant,
  fallbackPrice,
}: {
  selectedVariant: ShopifyVariant | null | undefined;
  fallbackPrice: number | null | undefined;
}) {
  if (selectedVariant) {
    return (
      <PriceDisplay
        compareAtPrice={selectedVariant.compareAtPrice}
        price={selectedVariant.price}
      />
    );
  }

  if (fallbackPrice != null) {
    return (
      <p className="font-medium text-lg">
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(fallbackPrice)}
      </p>
    );
  }

  return null;
}

function ProductActions({
  selectedVariant,
  shopifyProduct,
  handle,
  variants,
}: {
  selectedVariant: ShopifyVariant | null | undefined;
  shopifyProduct: ShopifyProduct | null;
  handle: string;
  variants: ShopifyVariant[];
}) {
  return (
    <>
      {shopifyProduct && variants.length > 0 && (
        <VariantSelector
          handle={handle}
          options={shopifyProduct.options}
          variants={variants}
        />
      )}

      {selectedVariant ? (
        <AddToCart
          availableForSale={selectedVariant.availableForSale}
          variantId={selectedVariant.id}
        />
      ) : (
        <p className="text-muted-foreground text-sm">
          This product is currently unavailable.
        </p>
      )}
    </>
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

  if (!sanityProduct) {
    notFound();
  }

  await resolveGids(sanityProduct);

  const shopifyProduct = shopifyResult.ok ? shopifyResult.data.product : null;
  const variants = shopifyProduct?.variants.edges.map((e) => e.node) ?? [];
  const images = shopifyProduct?.images.edges.map((e) => e.node) ?? [];

  const selectedVariant =
    variants.length > 0
      ? (findVariantByOptions(variants, sp) ?? variants[0])
      : null;

  const title = shopifyProduct?.title ?? sanityProduct.store?.title ?? handle;
  const vendor = shopifyProduct?.vendor ?? sanityProduct.store?.vendor;

  return (
    <>
      {shopifyProduct && (
        <ProductJsonLd handle={handle} product={shopifyProduct} />
      )}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <ProductImage
            fallbackAlt={sanityProduct.store?.title ?? handle}
            fallbackUrl={sanityProduct.store?.previewImageUrl}
            images={images}
            selectedVariantImageUrl={selectedVariant?.image?.url}
          />

          <div className="flex flex-col gap-6">
            <div>
              <h1 className="font-semibold text-3xl">{title}</h1>
              {vendor && <p className="mt-1 text-muted-foreground">{vendor}</p>}
            </div>

            <ProductPrice
              fallbackPrice={sanityProduct.store?.priceRange?.minVariantPrice}
              selectedVariant={selectedVariant}
            />

            <ProductActions
              handle={handle}
              selectedVariant={selectedVariant}
              shopifyProduct={shopifyProduct}
              variants={variants}
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
