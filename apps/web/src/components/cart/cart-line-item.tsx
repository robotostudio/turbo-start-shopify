"use client";

import { Button } from "@workspace/ui/components/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

import { formatMoney } from "@/lib/shopify/money";
import type { CartLine } from "@/lib/shopify/types";
import { useCart } from "./cart-context";

export function CartLineItem({ line }: { line: CartLine }) {
  const { updateLine, removeLine } = useCart();

  return (
    <div className="flex gap-4 py-4">
      {line.merchandise.image ? (
        <div className="relative size-20 shrink-0 overflow-hidden border">
          <Image
            alt={line.merchandise.image.altText ?? line.merchandise.title}
            className="object-cover"
            fill
            sizes="80px"
            src={line.merchandise.image.url}
          />
        </div>
      ) : (
        <div className="size-20 shrink-0 border bg-muted" />
      )}

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <p className="font-medium text-sm leading-tight">
            {line.merchandise.product.title}
          </p>
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
