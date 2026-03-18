import Image from "next/image";
import Link from "next/link";

import { SavedItemButton } from "@/components/saved-items/saved-item-button";
import { formatMoney } from "@/lib/shopify/money";

type ProductCardProps = {
  slug: string;
  title: string;
  priceRange: { minVariantPrice: number; maxVariantPrice: number };
  currencyCode?: string;
  imageUrl: string | null;
  vendor?: string | null;
  mini?: boolean;
};

export function ProductCard({
  slug,
  title,
  priceRange,
  currencyCode,
  imageUrl,
  vendor,
  mini,
}: ProductCardProps) {
  const code = currencyCode ?? "GBP";
  const formattedPrice = formatMoney({
    amount: String(priceRange.minVariantPrice),
    currencyCode: code,
  });
  const formattedMaxPrice = formatMoney({
    amount: String(priceRange.maxVariantPrice),
    currencyCode: code,
  });

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
            {formattedPrice}
            {showRange && (
              <span className="ml-1 line-through">{formattedMaxPrice}</span>
            )}
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
          <h3 className="font-normal text-sm leading-tight">{title}</h3>
          {vendor && (
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {vendor}
            </p>
          )}
          <p className="font-normal text-sm">
            {formattedPrice}
            {showRange && (
              <span className="ml-1 text-muted-foreground line-through">
                {formattedMaxPrice}
              </span>
            )}
          </p>
        </div>
      </Link>
      <SavedItemButton
        className="absolute top-2 right-2 z-10 transition-opacity md:pointer-events-none md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:opacity-100 md:focus-visible:pointer-events-auto md:focus-visible:opacity-100 md:data-[saved=true]:pointer-events-auto md:data-[saved=true]:opacity-100"
        handle={slug}
      />
    </div>
  );
}
