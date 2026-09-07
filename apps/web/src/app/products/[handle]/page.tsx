import { client } from "@workspace/sanity/client";
import { sanityFetch } from "@workspace/sanity/live";
import {
  queryProductByHandle,
  queryProductPaths,
} from "@workspace/sanity/query";
import Link from "next/link";
import { notFound } from "next/navigation";
import sanitizeHtml from "sanitize-html";

import { BreadcrumbJsonLd } from "@/components/json-ld";
import { PriceDisplay } from "@/components/product/price-display";
import {
  type AccordionSection,
  ProductAccordion,
} from "@/components/product/product-accordion";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductJsonLd } from "@/components/product/product-json-ld";
import { ProductPurchase } from "@/components/product/product-purchase";
import { RelatedProducts } from "@/components/product/related-products";
import { VariantSelector } from "@/components/product/variant-selector";
import { SavedItemButton } from "@/components/saved-items/saved-item-button";
import { buildLineMetadata } from "@/lib/cart/metadata";
import { getSEOMetadata } from "@/lib/seo";
import { storefrontQuery } from "@/lib/shopify/client";
import { keyMetafields } from "@/lib/shopify/metafields";
import { PRODUCT_QUERY } from "@/lib/shopify/queries";
import {
  LOW_STOCK_THRESHOLD,
  type ProductQueryResponse,
  type ShopifyProduct,
  type ShopifyVariant,
} from "@/lib/shopify/types";
import { findVariantByOptions } from "@/lib/shopify/variant-utils";
import { getBaseUrl, titleFromHandle } from "@/utils";

/** Builds the PDP accordion from the Shopify description + `custom.*` metafields. */
function buildAccordionSections(product: ShopifyProduct): AccordionSection[] {
  const metafields = keyMetafields(product.metafields);
  const sections: AccordionSection[] = [];

  if (product.descriptionHtml) {
    sections.push({
      id: "description",
      title: "Description",
      content: sanitizeHtml(product.descriptionHtml),
      isHtml: true,
    });
  }

  const metafieldSections: { id: string; title: string; value?: string }[] = [
    { id: "details", title: "Details", value: metafields.details },
    { id: "fit", title: "Fit & Sizing", value: metafields.fit_sizing },
    {
      id: "materials",
      title: "Materials & Composition",
      value: metafields.materials,
    },
    { id: "shipping", title: "Shipping & Returns", value: metafields.shipping },
  ];

  for (const { id, title, value } of metafieldSections) {
    if (value) sections.push({ id, title, content: value });
  }

  return sections;
}

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

  // As with collections: a doc-less product still renders, and `{}` would leave
  // it with no canonical and no robots tag.
  return await getSEOMetadata({
    title: product?.seo?.title || product?.title || titleFromHandle(handle),
    description: product?.seo?.description ?? "",
    slug: `/products/${handle}`,
    contentId: product?._id,
    contentType: product?._type,
  });
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
      <p className="font-medium text-amber-600 text-sm">
        Only {quantityAvailable} left in stock
      </p>
    );
  }

  return <p className="text-muted-foreground text-sm">In stock</p>;
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
  const category = shopifyProduct.productType;
  // The product's category collection (Shirts, Accessories, …) — the first that
  // isn't a store-wide bucket. Linked by its real Shopify handle per issue #92.
  const BUCKET_HANDLES = new Set(["all-products", "new-arrivals", "sale"]);
  const collection = shopifyProduct.collections.edges
    .map((e) => e.node)
    .find((c) => !BUCKET_HANDLES.has(c.handle));

  const lineMetadata = buildLineMetadata({
    productTitle: title,
    productHandle: handle,
    variantTitle: selectedVariant.title,
    price: selectedVariant.price,
    selectedOptions: selectedVariant.selectedOptions,
    image: selectedVariant.image ?? images[0] ?? null,
  });

  // Accordion content: Shopify description + `custom.*` metafields.
  const accordionSections = buildAccordionSections(shopifyProduct);

  const baseUrl = getBaseUrl();

  return (
    <>
      <ProductJsonLd handle={handle} product={shopifyProduct} />
      <BreadcrumbJsonLd
        // No "Collections" crumb: it is not the parent of /products/{handle}.
        items={[{ name: "Home", url: baseUrl }, { name: title }]}
      />
      <main className="site-container py-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,600px)] 2xl:grid-cols-[minmax(0,1fr)_minmax(0,760px)]">
          {/* Info column — sticky on desktop, uniform 32px rhythm */}
          <div className="flex min-w-0 max-w-2xl flex-col gap-8 self-start lg:sticky lg:top-24">
            {/* Season / brand eyebrow + save */}
            <div className="flex items-start justify-between gap-4">
              {vendor ? (
                <p className="text-muted-foreground text-sm">{vendor}</p>
              ) : (
                <span />
              )}
              {/* 44px hitbox passed from here, not baked into SavedItemButton:
               * on a ProductCard it sits absolutely over the product link, and
               * an invisible 44px box there would eat clicks meant for the
               * product. */}
              <SavedItemButton
                className="relative text-muted-foreground hover:text-foreground before:absolute before:top-1/2 before:left-1/2 before:size-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"
                handle={handle}
              />
            </div>

            {/* Category + title + price */}
            <div className="flex flex-col gap-2">
              {category &&
                (collection ? (
                  <Link
                    className="w-fit text-muted-foreground text-sm transition-colors hover:text-foreground focus-visible:text-foreground"
                    href={`/collections/${collection.handle.toLowerCase()}`}
                  >
                    {category}
                  </Link>
                ) : (
                  <p className="text-muted-foreground text-sm">{category}</p>
                ))}
              <h1 className="font-medium text-2xl tracking-tight lg:text-3xl">
                {title}
              </h1>
              <ProductPrice selectedVariant={selectedVariant} />
            </div>

            {/* Variant selectors */}
            {variants.length > 0 && (
              <VariantSelector
                handle={handle}
                options={shopifyProduct.options}
                variants={variants}
              />
            )}

            {/* Add to cart + stock */}
            <div className="flex flex-col gap-2">
              <ProductPurchase
                availableForSale={selectedVariant.availableForSale}
                metadata={lineMetadata}
                optionsSelected={allOptionsSelected}
                quantityAvailable={selectedVariant.quantityAvailable}
                variantId={selectedVariant.id}
              />
              <StockIndicator
                availableForSale={selectedVariant.availableForSale}
                quantityAvailable={selectedVariant.quantityAvailable}
              />
            </div>

            {/* Accordion — Description + metafields */}
            {accordionSections.length > 0 && (
              <ProductAccordion
                defaultOpenId="description"
                sections={accordionSections}
              />
            )}
          </div>

          {/* Gallery — vertical thumbnail rail + scrolling image column */}
          <ProductGallery
            images={images}
            selectedVariantImageUrl={selectedVariant?.image?.url}
          />
        </div>

        <RelatedProducts productId={shopifyProduct.id} />
      </main>
    </>
  );
}
