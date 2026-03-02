"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type CollectionPaginationProps = {
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
};

export function CollectionPagination({ pageInfo }: CollectionPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const loadMore = useCallback(() => {
    if (!pageInfo.endCursor) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("after", pageInfo.endCursor);
    router.push(`?${params.toString()}`);
  }, [pageInfo.endCursor, router, searchParams]);

  if (!pageInfo.hasNextPage) return null;

  return (
    <div className="mt-8 flex justify-center">
      <button
        className="rounded-none border border-foreground bg-transparent px-8 py-3 text-sm uppercase tracking-wider text-foreground transition-colors hover:bg-foreground hover:text-white dark:hover:text-black"
        onClick={loadMore}
        type="button"
      >
        Load More
      </button>
    </div>
  );
}
