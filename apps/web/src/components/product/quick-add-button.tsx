"use client";

import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";

import { useCart } from "@/components/cart/cart-context";

type QuickAddButtonProps = {
  variantId?: string;
  availableForSale?: boolean;
  hasMultipleVariants?: boolean;
  slug: string;
};

export function QuickAddButton({
  variantId,
  availableForSale,
  hasMultipleVariants,
  slug,
}: QuickAddButtonProps) {
  const { addLine } = useCart();

  if (!availableForSale) {
    return (
      <div className="w-full bg-muted px-3 py-2 text-center text-xs uppercase tracking-wider text-muted-foreground">
        Sold Out
      </div>
    );
  }

  if (hasMultipleVariants || !variantId) {
    return (
      <Link
        className="flex w-full items-center justify-center gap-1.5 bg-foreground px-3 py-2 text-xs uppercase tracking-wider text-background transition-colors hover:bg-foreground/90"
        href={`/products/${slug}`}
      >
        <ArrowRight size={14} />
        Select Options
      </Link>
    );
  }

  return (
    <button
      className="flex w-full items-center justify-center gap-1.5 bg-foreground px-3 py-2 text-xs uppercase tracking-wider text-background transition-colors hover:bg-foreground/90"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        addLine(variantId, 1);
      }}
      type="button"
    >
      <Plus size={14} />
      Quick Add
    </button>
  );
}
