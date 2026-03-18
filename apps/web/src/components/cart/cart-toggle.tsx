"use client";

import { Button } from "@workspace/ui/components/button";
import { Handbag } from "lucide-react";

import { useCart } from "./cart-context";

export function CartToggle() {
  const { cart, openCart } = useCart();
  const quantity = cart?.totalQuantity ?? 0;

  return (
    <Button
      aria-label={`Cart${quantity > 0 ? ` (${quantity} items)` : ""}`}
      className="relative"
      onClick={openCart}
      size="icon"
      variant="ghost"
    >
      <Handbag className="size-5" />
      {quantity > 0 && (
        <span
          key={quantity}
          className="absolute -top-1.5 -right-1.5 flex size-4.5 items-center justify-center bg-foreground text-[10px] text-background font-medium animate-[cartBadgePop_0.3s_ease-out]"
        >
          {quantity > 99 ? "99+" : quantity}
        </span>
      )}
    </Button>
  );
}
