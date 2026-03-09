"use client";

import { Heart } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";

import { useSavedItems } from "./saved-items-context";

type SavedItemButtonProps = {
  handle: string;
  className?: string;
};

export function SavedItemButton({ handle, className }: SavedItemButtonProps) {
  const { toggle, isInSavedItems } = useSavedItems();
  const isSaved = isInSavedItems(handle);

  return (
    <button
      aria-label={isSaved ? "Remove from saved items" : "Save for later"}
      aria-pressed={isSaved}
      className={cn(
        "group/heart flex size-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-all hover:bg-background hover:scale-110 active:scale-95",
        className
      )}
      data-saved={isSaved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(handle);
      }}
      type="button"
    >
      <Heart
        className={cn(
          "size-4 transition-colors",
          isSaved
            ? "fill-red-500 text-red-500"
            : "fill-transparent text-foreground group-hover/heart:text-red-500"
        )}
      />
    </button>
  );
}
