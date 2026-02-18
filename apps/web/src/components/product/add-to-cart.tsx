"use client";

import { Button } from "@workspace/ui/components/button";
import { Loader2, ShoppingBag } from "lucide-react";
import { useState } from "react";

import { useCart } from "@/components/cart/cart-context";

type AddToCartProps = {
  variantId: string;
  availableForSale: boolean;
};

export function AddToCart({ variantId, availableForSale }: AddToCartProps) {
  const { addLine, openCart } = useCart();
  const [isPending, setIsPending] = useState(false);

  if (!availableForSale) {
    return (
      <Button className="w-full" disabled size="lg">
        Sold Out
      </Button>
    );
  }

  return (
    <Button
      className="w-full"
      disabled={isPending}
      onClick={async () => {
        setIsPending(true);
        await addLine(variantId, 1);
        setIsPending(false);
        openCart();
      }}
      size="lg"
    >
      {isPending ? (
        <Loader2 className="mr-2 size-4 animate-spin" />
      ) : (
        <ShoppingBag className="mr-2 size-4" />
      )}
      Add to Cart
    </Button>
  );
}
