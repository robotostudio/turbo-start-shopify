import { client } from "@workspace/sanity/client";
import { sanityFetch } from "@workspace/sanity/live";
import {
  queryProductByHandle,
  queryProductPaths,
} from "@workspace/sanity/query";
import sanitizeHtml from "sanitize-html";
import { notFound } from "next/navigation";

import { AddToCart } from "@/components/product/add-to-cart";
import { PriceDisplay } from "@/components/product/price-display";
import { ProductBody } from "@/components/product/product-body";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductJsonLd } from "@/components/product/product-json-ld";
import { RelatedProducts } from "@/components/product/related-products";
import { VariantSelector } from "@/components/product/variant-selector";
import { SavedItemButton } from "@/components/saved-items/saved-item-button";
import { getSEOMetadata } from "@/lib/seo";
import { storefrontQuery } from "@/lib/shopify/client";
import { PRODUCT_QUERY } from "@/lib/shopify/queries";
import {
  LOW_STOCK_THRESHOLD,
  type ProductQueryResponse,
  type ShopifyImage,
  type ShopifyProduct,
  type ShopifyVariant,
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
    title: product.seo?.title || product.title || "",
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

function StockIndicator({
  quantityAvailable,
  availableForSale,
}: {
  quantityAvailable: number | null;
  availableForSale: boolean;
}) {
  if (!availableForSale || quantityAvailable === null || quantityAvailable <= 0)
    return null;

  if (quantityAvailable <= LOW_STOCK_THRESHOLD) {
    return (
      <p className="text-sm font-medium text-amber-600">
        Only {quantityAvailable} left in stock
      </p>
    );
  }

  return <p className="text-sm text-muted-foreground">In stock</p>;
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
  const defaultVariant = variants[0];
  const selectableOptions = shopifyProduct.options.filter(
    (o) => o.values.length > 1
  );
  const resolvedSelections: Record<string, string> = {};
  for (const o of shopifyProduct.options) {
    const fromUrl = sp[o.name];
    const fallback =
      defaultVariant?.selectedOptions.find((so) => so.name === o.name)?.value ??
      "";
    resolvedSelections[o.name] = fromUrl ?? fallback;
  }
  const allOptionsSelected = selectableOptions.every((o) => {
    const value = resolvedSelections[o.name];
    return value !== undefined && o.values.includes(value);
  });
  const selectedVariant =
    findVariantByOptions(variants, resolvedSelections) ?? defaultVariant;
  if (!selectedVariant) {
    notFound();
  }

  const title = shopifyProduct.title;
  const vendor = shopifyProduct.vendor;
  const descriptionHtml = shopifyProduct.descriptionHtml;

  return (
    <>
      <ProductJsonLd handle={handle} product={shopifyProduct} />
      <div className="mx-auto container px-4 py-8 lg:px-8">
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

            <StockIndicator
              availableForSale={selectedVariant.availableForSale}
              quantityAvailable={selectedVariant.quantityAvailable}
            />

            <div className="border-t border-border" />

            {/* Variant selectors */}
            <ProductActions
              handle={handle}
              shopifyProduct={shopifyProduct}
              variants={variants}
            />

            {/* Add to Cart + Save */}
            <div className="flex gap-3">
              <div className="flex-1">
                <AddToCart
                  availableForSale={selectedVariant.availableForSale}
                  key={selectedVariant.id}
                  optionsSelected={allOptionsSelected}
                  variantId={selectedVariant.id}
                />
              </div>
              <SavedItemButton
                className="flex size-12 shrink-0 items-center justify-center rounded-none border border-border transition-colors hover:bg-accent"
                handle={handle}
              />
            </div>

            <div className="border-t border-border" />

            {/* Description from Shopify */}
            {descriptionHtml && (
              <div className="space-y-2">
                <div
                  className="prose prose-sm dark:prose-invert text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(descriptionHtml),
                  }}
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

        <RelatedProducts productId={shopifyProduct.id} />
      </div>
    </>
  );
}
