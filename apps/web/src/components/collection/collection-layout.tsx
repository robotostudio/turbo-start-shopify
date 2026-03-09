"use client";

import { Button } from "@workspace/ui/components/button";
import { SlidersHorizontal } from "lucide-react";
import { createContext, useContext, useState } from "react";

import { FilterPanel } from "@/components/collection/filter-panel";
import type { ShopifyFilter } from "@/lib/shopify/types";

type FilterVisibilityContextType = {
  showFilters: boolean;
  toggle: () => void;
};

const FilterVisibilityContext =
  createContext<FilterVisibilityContextType>({
    showFilters: true,
    toggle: () => {},
  });

export function FilterVisibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showFilters, setShowFilters] = useState(true);

  return (
    <FilterVisibilityContext value={{ showFilters, toggle: () => setShowFilters((p) => !p) }}>
      {children}
    </FilterVisibilityContext>
  );
}

export function FilterToggle() {
  const { showFilters, toggle } = useContext(FilterVisibilityContext);

  return (
    <Button
      size="sm"
      onClick={toggle}
      className="hidden items-center gap-2 rounded-none border border-foreground bg-transparent px-6 py-2.5 text-sm text-foreground tracking-wider transition-colors hover:bg-foreground hover:text-background focus-visible:ring-0 lg:flex"
    >
      <SlidersHorizontal className="size-4" />
      {showFilters ? "Hide Filters" : "Show Filters"}
    </Button>
  );
}

type CollectionLayoutProps = {
  filters: ShopifyFilter[];
  children: React.ReactNode;
};

export function CollectionLayout({
  filters,
  children,
}: CollectionLayoutProps) {
  const { showFilters } = useContext(FilterVisibilityContext);

  return (
    <div className={`flex ${showFilters ? "gap-8" : "gap-0"}`}>
      <aside
        className={`hidden shrink-0 transition-all duration-300 lg:block ${showFilters ? "w-64" : "w-0 overflow-hidden opacity-0"}`}
      >
        <FilterPanel filters={filters} />
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
