"use client";

import { Button } from "@workspace/ui/components/button";
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
      <Button onClick={loadMore} size="lg" variant="outline">
        Load More
      </Button>
    </div>
  );
}
