"use client";

import { Input } from "@workspace/ui/components/input";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";

export function SearchInput() {
  const searchParams = useSearchParams();
  const defaultQuery = searchParams.get("q") ?? "";

  return (
    <form action="/search" className="relative w-full" method="get">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        autoFocus
        className="pl-10"
        defaultValue={defaultQuery}
        name="q"
        placeholder="Search products..."
        type="search"
      />
    </form>
  );
}
