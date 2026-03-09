"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import type { QueryAllCollectionsResult } from "@workspace/sanity/types";
import { ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export type SortOption = "a-z" | "z-a" | "newest";

const SORT_LABELS: Record<SortOption, string> = {
  "a-z": "A-Z",
  "z-a": "Z-A",
  newest: "Newest",
};

export function sortCollections(
  collections: QueryAllCollectionsResult,
  sort: SortOption
): QueryAllCollectionsResult {
  const sorted = [...collections];
  switch (sort) {
    case "a-z":
      return sorted.sort((a, b) =>
        (a.title ?? "").localeCompare(b.title ?? "")
      );
    case "z-a":
      return sorted.sort((a, b) =>
        (b.title ?? "").localeCompare(a.title ?? "")
      );
    case "newest":
      return sorted.sort(
        (a, b) =>
          new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime()
      );
    default:
      return sorted;
  }
}

export function CollectionsSortSelector() {
  const searchParams = useSearchParams();
  const router = useRouter();
  function handleSort(option: SortOption) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", option);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-none border px-4 py-2 text-sm hover:bg-accent">
        Sort by
        <ChevronDown className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-none">
        {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(
          ([value, label]) => (
            <DropdownMenuItem key={value} onSelect={() => handleSort(value)}>
              {label}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
