"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { SlidersHorizontal } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

import { FilterPanel } from "@/components/collection/filter-panel";
import { countActiveFilters } from "@/components/collection/filter-utils";
import type { ShopifyFilter } from "@/lib/shopify/types";

type FilterDrawerProps = {
  filters: ShopifyFilter[];
};

export function FilterDrawer({ filters }: FilterDrawerProps) {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const filterCount = countActiveFilters(searchParams);

  // Close drawer when URL changes (filter applied)
  const urlRef = useRef(`${pathname}?${searchParams.toString()}`);
  const currentUrl = `${pathname}?${searchParams.toString()}`;
  if (urlRef.current !== currentUrl) {
    urlRef.current = currentUrl;
    if (open) setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-none border border-foreground bg-transparent px-6 py-2.5 text-sm text-foreground tracking-wider transition-colors hover:bg-foreground hover:text-background focus-visible:ring-0 lg:hidden"
      >
        <SlidersHorizontal className="size-4" />
        Filter{filterCount > 0 && ` (${filterCount})`}
      </Button>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription className="sr-only">
            Filter products in this collection
          </SheetDescription>
        </SheetHeader>
        <div className="px-1">
          <FilterPanel filters={filters} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
