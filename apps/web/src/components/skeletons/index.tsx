function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-muted ${className ?? ""}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-3/4 w-full" />
      <div className="space-y-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
      <Skeleton className="aspect-video w-full" />
      <div className="flex flex-col justify-center gap-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  );
}

export function BlogListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-12">
      {Array.from({ length: count }, (_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto container px-4 py-8 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <Skeleton className="aspect-3/4 w-full" />
        <div className="flex flex-col gap-6">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <div className="border-t border-border" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton className="size-10" key={i} />
            ))}
          </div>
          <Skeleton className="h-12 w-full" />
          <div className="border-t border-border" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CollectionHeaderSkeleton() {
  return (
    <div className="mb-8">
      <Skeleton className="h-9 w-1/3" />
      <Skeleton className="mt-2 h-5 w-2/3" />
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="container mx-auto px-4 py-16">
      <Skeleton className="mb-8 h-9 w-32" />
      <Skeleton className="mb-8 h-10 max-w-lg" />
      <ProductGridSkeleton count={8} />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <Skeleton className="mx-auto h-12 w-1/2" />
        <Skeleton className="mx-auto h-6 w-2/3" />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}
