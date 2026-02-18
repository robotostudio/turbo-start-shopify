"use client";

import { useState } from "react";

import type { QueryProductByHandleResult } from "@workspace/sanity/types";

import { SanityImage } from "@/components/elements/sanity-image";
import { ProductCard } from "./product-card";

type HotspotData = NonNullable<
  Extract<
    NonNullable<NonNullable<QueryProductByHandleResult>["body"]>[number],
    { _type: "imageWithProductHotspots" }
  >["productHotspots"]
>;

type ProductHotspotsImageProps = {
  image: {
    id: string | null;
    preview: string | null;
    alt: string | "untitled";
    hotspot: { x: number; y: number } | null;
    crop: {
      bottom: number;
      left: number;
      right: number;
      top: number;
    } | null;
  };
  productHotspots: HotspotData | null;
  showHotspots: boolean | null;
};

export function ProductHotspotsImage({
  image,
  productHotspots,
  showHotspots,
}: ProductHotspotsImageProps) {
  const [activeSpot, setActiveSpot] = useState<string | null>(null);

  if (!image.id) return null;

  return (
    <div className="relative overflow-hidden rounded-lg">
      <SanityImage
        className="h-auto w-full"
        height={900}
        image={image}
        width={1600}
      />

      {showHotspots &&
        productHotspots?.map((spot) => {
          const product = spot.productWithVariant?.product;
          if (!product?.store) return null;

          return (
            <div
              className="absolute"
              key={spot._key}
              style={{
                left: `${spot.x}%`,
                top: `${spot.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <button
                className="relative flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110"
                onClick={() =>
                  setActiveSpot(activeSpot === spot._key ? null : spot._key)
                }
                type="button"
              >
                <span className="absolute size-full animate-ping rounded-full bg-primary opacity-20" />
                <span className="text-xs font-bold">+</span>
              </button>

              {activeSpot === spot._key && (
                <div className="absolute top-full left-1/2 z-10 mt-2 w-56 -translate-x-1/2 rounded-lg border bg-popover p-1 shadow-lg">
                  <ProductCard
                    imageUrl={product.store.previewImageUrl}
                    mini
                    priceRange={{
                      minVariantPrice:
                        product.store.priceRange?.minVariantPrice ?? 0,
                      maxVariantPrice:
                        product.store.priceRange?.maxVariantPrice ??
                        product.store.priceRange?.minVariantPrice ??
                        0,
                    }}
                    slug={product.slug ?? ""}
                    title={product.store.title ?? "Untitled"}
                  />
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}
