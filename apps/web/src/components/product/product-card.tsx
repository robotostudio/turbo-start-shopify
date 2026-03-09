import Image from "next/image";
import Link from "next/link";

import { SavedItemButton } from "@/components/saved-items/saved-item-button";

type ProductCardProps = {
  slug: string;
  title: string;
  priceRange: { minVariantPrice: number; maxVariantPrice: number };
  imageUrl: string | null;
  vendor?: string | null;
  mini?: boolean;
};

export function ProductCard({
  slug,
  title,
  priceRange,
  imageUrl,
  vendor,
  mini,
}: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceRange.minVariantPrice);

  const showRange = priceRange.minVariantPrice !== priceRange.maxVariantPrice;

  if (mini) {
    return (
      <Link
        className="flex items-center gap-3 p-2 transition-colors hover:bg-accent"
        href={`/products/${slug}`}
      >
        {imageUrl ? (
          <div className="relative size-12 shrink-0 overflow-hidden border">
            <Image
              alt={title}
              className="object-cover"
              fill
              sizes="48px"
              src={imageUrl}
            />
          </div>
        ) : (
          <div className="size-12 shrink-0 border bg-muted" />
        )}
        <div className="min-w-0">
          <p className="truncate font-medium text-sm">{title}</p>
          <p className="text-muted-foreground text-xs">
            {showRange ? `From ${formattedPrice}` : formattedPrice}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <div className="group relative">
      <Link className="block space-y-3" href={`/products/${slug}`}>
        <div className="relative aspect-3/4 overflow-hidden bg-muted">
          {imageUrl ? (
            <Image
              alt={title}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              src={imageUrl}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              No image
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="font-normal text-sm leading-tight">
            {title}
          </h3>
          {vendor && (
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {vendor}
            </p>
          )}
          <p className="font-normal text-sm">
            {showRange ? `From ${formattedPrice}` : formattedPrice}
          </p>
        </div>
      </Link>
      <SavedItemButton
        className="absolute top-2 right-2 z-10 md:opacity-0 md:group-hover:opacity-100 md:data-[saved=true]:opacity-100 transition-opacity"
        handle={slug}
      />
    </div>
  );
}
