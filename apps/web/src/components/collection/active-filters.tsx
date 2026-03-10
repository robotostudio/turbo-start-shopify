"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import {
  clearAllFilters,
  getActiveFilters,
  removeFilterParam,
} from "@/components/collection/filter-utils";

export function ActiveFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = getActiveFilters(searchParams);

  const handleRemove = useCallback(
    (paramKey: string, paramValue: string) => {
      const qs = removeFilterParam(searchParams, paramKey, paramValue);
      router.push(qs ? `?${qs}` : pathname);
    },
    [router, pathname, searchParams]
  );

  const handleClearAll = useCallback(() => {
    const qs = clearAllFilters(searchParams);
    router.push(qs ? `?${qs}` : pathname);
  }, [router, pathname, searchParams]);

  if (active.length === 0) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {active.map((filter) => (
        <Badge
          key={filter.key}
          variant={filter.invalid ? "destructive" : "outline"}
          className="flex items-center gap-1 rounded-none px-3 py-1 text-sm"
        >
          {filter.label}
          <button
            type="button"
            onClick={() => handleRemove(filter.paramKey, filter.paramValue)}
            className={`ml-1 ${filter.invalid ? "hover:text-white/70" : "hover:text-destructive"}`}
          >
            <X className="size-3" />
            <span className="sr-only">Remove {filter.label} filter</span>
          </button>
        </Badge>
      ))}
      <Button
        size="sm"
        variant="ghost"
        onClick={handleClearAll}
        className="h-auto rounded-none px-2 py-1 text-muted-foreground text-xs hover:text-foreground"
      >
        Clear all
      </Button>
    </div>
  );
}
