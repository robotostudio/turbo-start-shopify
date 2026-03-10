"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ZoomIn } from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";

import { cn } from "@workspace/ui/lib/utils";

import type { ShopifyImage } from "@/lib/shopify/types";

type ProductGalleryProps = {
  images: ShopifyImage[];
  selectedVariantImageUrl?: string;
};

const MIN_ZOOM = 200;
const MAX_ZOOM = 400;

function ZoomLayer({
  image,
  isZoomed,
  zoomRef,
  containerRef,
}: {
  image: ShopifyImage;
  isZoomed: boolean;
  zoomRef: React.RefObject<HTMLDivElement | null>;
  containerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const containerWidth = containerRef.current?.offsetWidth ?? 0;
  const nativeWidth = image.width ?? 0;

  // Scale zoom based on how much larger the source is than the container
  const ratio = containerWidth > 0 ? nativeWidth / containerWidth : 2;
  const zoomPct = Math.min(
    MAX_ZOOM,
    Math.max(MIN_ZOOM, Math.round(ratio * 100))
  );

  return (
    <div
      ref={zoomRef}
      className={cn(
        "absolute inset-0 aspect-3/4 transition-opacity duration-200",
        isZoomed ? "opacity-100" : "pointer-events-none opacity-0"
      )}
      style={{
        backgroundImage: `url(${image.url})`,
        backgroundSize: `${zoomPct}%`,
        backgroundPosition: "50% 50%",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}

export function ProductGallery({
  images,
  selectedVariantImageUrl,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const isUserClick = useRef(false);

  // Zoom state
  const [isZoomed, setIsZoomed] = useState(false);
  const zoomContainerRef = useRef<HTMLButtonElement>(null);
  const zoomLayerRef = useRef<HTMLDivElement>(null);
  const rafId = useRef(0);

  const scrollTo = useCallback(
    (index: number) => {
      isUserClick.current = true;
      emblaApi?.scrollTo(index);
      setSelectedIndex(index);
      setIsZoomed(false);
    },
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setIsZoomed(false);
    };

    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // Scroll to variant image when variant changes
  const prevVariantUrl = useRef(selectedVariantImageUrl);
  useEffect(() => {
    if (!selectedVariantImageUrl || !emblaApi) return;
    if (
      selectedVariantImageUrl === prevVariantUrl.current &&
      isUserClick.current
    ) {
      isUserClick.current = false;
      return;
    }
    prevVariantUrl.current = selectedVariantImageUrl;
    isUserClick.current = false;

    const matchIndex = images.findIndex(
      (img) => img.url === selectedVariantImageUrl
    );
    if (matchIndex !== -1 && matchIndex !== selectedIndex) {
      emblaApi.scrollTo(matchIndex);
      setSelectedIndex(matchIndex);
    }
  }, [selectedVariantImageUrl, images, emblaApi, selectedIndex]);

  const handleZoomMove = (e: ReactMouseEvent<HTMLButtonElement>) => {
    if (!zoomContainerRef.current) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      const container = zoomContainerRef.current;
      const layer = zoomLayerRef.current;
      if (!container || !layer) return;
      const rect = container.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      layer.style.backgroundPosition = `${x}% ${y}%`;
    });
  };

  const currentImage = images[selectedIndex];

  if (images.length === 0) {
    return <div className="aspect-3/4 w-full bg-muted" />;
  }

  return (
    <div className="space-y-3">
      {/* Main image with pan-zoom */}
      <button
        ref={zoomContainerRef}
        type="button"
        aria-label={isZoomed ? "Close zoom" : "Zoom into product image"}
        className={cn(
          "group relative block w-full overflow-hidden text-left",
          isZoomed ? "cursor-crosshair" : "cursor-zoom-in"
        )}
        onClick={() => setIsZoomed((z) => !z)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && isZoomed) setIsZoomed(false);
        }}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleZoomMove}
      >
        {/* Zoom hint icon */}
        <div
          className={cn(
            "absolute top-3 right-3 z-10 bg-black/50 p-2 text-white transition-opacity duration-200",
            isZoomed ? "opacity-0" : "opacity-0 group-hover:opacity-100"
          )}
        >
          <ZoomIn className="size-4" />
        </div>

        {/* Carousel layer — visible when not zoomed */}
        <div
          className={cn(
            "transition-opacity duration-200",
            isZoomed ? "opacity-0" : "opacity-100"
          )}
          ref={emblaRef}
        >
          <div className="flex">
            {images.map((image, index) => (
              <div className="min-w-0 shrink-0 basis-full" key={image.url}>
                <div className="relative aspect-3/4">
                  <Image
                    alt={image.altText ?? "Product image"}
                    className="object-cover"
                    fill
                    priority={index === 0}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    src={image.url}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zoomed layer — shows on click/hover, follows cursor */}
        {currentImage && (
          <ZoomLayer
            image={currentImage}
            isZoomed={isZoomed}
            zoomRef={zoomLayerRef}
            containerRef={zoomContainerRef}
          />
        )}
      </button>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pt-4">
          {images.map((image, index) => (
            <button
              className={cn(
                "shrink-0 border-b pb-1 transition-colors",
                index === selectedIndex
                  ? "border-foreground"
                  : "border-transparent hover:border-muted-foreground/40"
              )}
              key={image.url}
              onClick={() => scrollTo(index)}
              type="button"
            >
              <div className="relative size-20 overflow-hidden">
                <Image
                  alt={image.altText ?? `Thumbnail ${index + 1}`}
                  className="object-cover"
                  fill
                  sizes="80px"
                  src={image.url}
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
