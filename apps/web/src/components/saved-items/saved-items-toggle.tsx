"use client";

import { Button } from "@workspace/ui/components/button";
import { Heart } from "lucide-react";
import Link from "next/link";

import { useSavedItems } from "./saved-items-context";

export function SavedItemsToggle() {
  const { count } = useSavedItems();

  return (
    <Button
      aria-label={`Saved items${count > 0 ? ` (${count} items)` : ""}`}
      asChild
      className="relative"
      size="icon"
      variant="ghost"
    >
      <Link href="/saved">
        <Heart className="size-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-primary-foreground text-xs font-medium">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Link>
    </Button>
  );
}
