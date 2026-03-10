"use client";

import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { ArrowUpDown, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const SORT_OPTIONS = [
  { label: "Featured", sortKey: "COLLECTION_DEFAULT", reverse: false },
  { label: "Price: Low to High", sortKey: "PRICE", reverse: false },
  { label: "Price: High to Low", sortKey: "PRICE", reverse: true },
  { label: "Title: A-Z", sortKey: "TITLE", reverse: false },
  { label: "Title: Z-A", sortKey: "TITLE", reverse: true },
  { label: "Best Selling", sortKey: "BEST_SELLING", reverse: false },
  { label: "Newest", sortKey: "CREATED", reverse: true },
] as const;

type SortSelectorProps = {
  currentSort: string;
  currentReverse: boolean;
};

export function SortSelector({
  currentSort,
  currentReverse,
}: SortSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isDefault =
    currentSort === "COLLECTION_DEFAULT" && currentReverse === false;

  const currentLabel =
    SORT_OPTIONS.find(
      (o) => o.sortKey === currentSort && o.reverse === currentReverse
    )?.label ?? "Featured";

  const handleSort = useCallback(
    (sortKey: string, reverse: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sort", sortKey);
      params.set("reverse", String(reverse));
      params.delete("after");
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleReset = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("sort");
    params.delete("reverse");
    params.delete("after");
    const qs = params.toString();
    router.push(qs ? `?${qs}` : pathname);
  }, [router, pathname, searchParams]);

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            className="flex items-center gap-2 rounded-none border border-foreground bg-transparent px-6 py-2.5 text-sm text-foreground tracking-wider transition-colors hover:bg-foreground hover:text-background focus-visible:ring-0"
          >
            <ArrowUpDown className="mr-2 size-4" />
            {currentLabel}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {SORT_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={`${option.sortKey}-${option.reverse}`}
              onClick={() => handleSort(option.sortKey, option.reverse)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {!isDefault && (
        <Button
          size="sm"
          onClick={handleReset}
          className="size-8 rounded-none border border-foreground bg-transparent p-0 text-foreground transition-colors hover:bg-foreground hover:text-background focus-visible:ring-0"
        >
          <X className="size-4" />
          <span className="sr-only">Reset sort</span>
        </Button>
      )}
    </div>
  );
}

export { parseSortParams } from "./sort-utils";
