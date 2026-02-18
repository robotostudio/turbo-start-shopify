import Image from "next/image";
import Link from "next/link";

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
        className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
        href={`/products/${slug}`}
      >
        {imageUrl ? (
          <div className="relative size-12 shrink-0 overflow-hidden rounded-md border">
            <Image
              alt={title}
              className="object-cover"
              fill
              sizes="48px"
              src={imageUrl}
            />
          </div>
        ) : (
          <div className="size-12 shrink-0 rounded-md border bg-muted" />
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
    <Link className="group block space-y-3" href={`/products/${slug}`}>
      <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
        {imageUrl ? (
          <Image
            alt={title}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
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
        <h3 className="font-medium text-sm leading-tight group-hover:underline">
          {title}
        </h3>
        {vendor && <p className="text-muted-foreground text-xs">{vendor}</p>}
        <p className="font-medium text-sm">
          {showRange ? `From ${formattedPrice}` : formattedPrice}
        </p>
      </div>
    </Link>
  );
}
