"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { cn } from "@workspace/ui/lib/utils";

import type { ShopifyImage } from "@/lib/shopify/types";

type ProductGalleryProps = {
  images: ShopifyImage[];
  selectedVariantImageUrl?: string;
};

export function ProductGallery({
  images,
  selectedVariantImageUrl,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
      setSelectedIndex(index);
    },
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!selectedVariantImageUrl || !emblaApi) return;

    const matchIndex = images.findIndex(
      (img) => img.url === selectedVariantImageUrl
    );
    if (matchIndex !== -1 && matchIndex !== selectedIndex) {
      scrollTo(matchIndex);
    }
  }, [selectedVariantImageUrl, images, emblaApi, scrollTo, selectedIndex]);

  if (images.length === 0) {
    return <div className="aspect-square w-full rounded-xl border bg-muted" />;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border" ref={emblaRef}>
        <div className="flex">
          {images.map((image) => (
            <div className="min-w-0 flex-shrink-0 basis-full" key={image.url}>
              <div className="relative aspect-square">
                <Image
                  alt={image.altText ?? "Product image"}
                  className="object-cover"
                  fill
                  priority={images.indexOf(image) === 0}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  src={image.url}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                index === selectedIndex
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground/30"
              )}
              key={image.url}
              onClick={() => scrollTo(index)}
              type="button"
            >
              <Image
                alt={image.altText ?? `Thumbnail ${index + 1}`}
                className="object-cover"
                fill
                sizes="64px"
                src={image.url}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
