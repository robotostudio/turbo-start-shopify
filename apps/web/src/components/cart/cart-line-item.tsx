"use client";

import { Button } from "@workspace/ui/components/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { formatMoney } from "@/lib/shopify/money";
import type { CartLine } from "@/lib/shopify/types";
import { useCart } from "./cart-context";

function buildProductUrl(line: CartLine): string {
  const handle = line.merchandise.product.handle;
  const params = new URLSearchParams();
  for (const opt of line.merchandise.selectedOptions) {
    if (opt.value && opt.value !== "Default Title") {
      params.set(opt.name, opt.value);
    }
  }
  const qs = params.toString();
  return `/products/${handle}${qs ? `?${qs}` : ""}`;
}

export function CartLineItem({ line }: { line: CartLine }) {
  const { updateLine, removeLine, closeCart } = useCart();
  const productUrl = buildProductUrl(line);

  return (
    <div className="flex gap-4 py-4">
      <Link
        className="shrink-0"
        href={productUrl}
        onClick={closeCart}
      >
        {line.merchandise.image ? (
          <div className="relative size-20 overflow-hidden rounded-lg border">
            <Image
              alt={line.merchandise.image.altText ?? line.merchandise.title}
              className="object-cover"
              fill
              sizes="80px"
              src={line.merchandise.image.url}
            />
          </div>
        ) : (
          <div className="size-20 rounded-lg border bg-muted" />
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            className="font-medium text-sm leading-tight hover:underline"
            href={productUrl}
            onClick={closeCart}
          >
            {line.merchandise.product.title}
          </Link>
          {line.merchandise.title !== "Default Title" && (
            <p className="mt-0.5 text-muted-foreground text-xs">
              {line.merchandise.title}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              disabled={line.quantity <= 1}
              onClick={() => updateLine(line.id, line.quantity - 1)}
              size="icon"
              variant="outline"
              className="size-7"
            >
              <Minus className="size-3" />
            </Button>
            <span className="w-8 text-center text-sm">{line.quantity}</span>
            <Button
              onClick={() => updateLine(line.id, line.quantity + 1)}
              size="icon"
              variant="outline"
              className="size-7"
            >
              <Plus className="size-3" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">
              {formatMoney(line.cost.totalAmount)}
            </p>
            <Button
              className="size-7 text-muted-foreground hover:text-destructive"
              onClick={() => removeLine(line.id)}
              size="icon"
              variant="ghost"
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
