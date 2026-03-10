"use client";

import { Button } from "@workspace/ui/components/button";
import { Loader2 } from "lucide-react";

type CollectionPaginationProps = {
  hasNextPage: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
};

export function CollectionPagination({
  hasNextPage,
  isLoading,
  onLoadMore,
}: CollectionPaginationProps) {
  if (!hasNextPage) return null;

  return (
    <div className="mt-8 flex justify-center">
      <Button
        disabled={isLoading}
        onClick={onLoadMore}
        size="lg"
        className="rounded-none border border-foreground bg-transparent px-6 py-2.5 text-sm text-foreground tracking-wider transition-colors hover:bg-foreground hover:text-background focus-visible:ring-0"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Loading...
          </>
        ) : (
          "Load More"
        )}
      </Button>
    </div>
  );
}
