"use client";

import { Button } from "@workspace/ui/components/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";

import { checkVariantInventory } from "@/app/cart/actions";
import { useCart } from "@/components/cart/cart-context";

type AddToCartProps = {
  variantId: string;
  availableForSale: boolean;
  optionsSelected?: boolean;
};

export function AddToCart({
  variantId,
  availableForSale,
  optionsSelected = true,
}: AddToCartProps) {
  const { addLine, openCart } = useCart();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!availableForSale) {
    return (
      <Button
        className="w-full rounded-none uppercase py-6 px-8"
        disabled
        size="lg"
        variant="outline"
      >
        Sold Out
      </Button>
    );
  }

  if (!optionsSelected) {
    return (
      <Button
        className="w-full rounded-none uppercase py-6 px-8"
        disabled
        size="lg"
        variant="outline"
      >
        Select Options
      </Button>
    );
  }

  return (
    <div>
      <Button
        className="w-full rounded-none border-none uppercase py-6 px-8 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 dark:hover:text-zinc-900 tracking-wide transition-colors"
        disabled={isPending}
        onClick={async () => {
          setIsPending(true);
          setError(null);

          const inventory = await checkVariantInventory(variantId);

          if (!inventory.ok) {
            setError("Unable to verify availability. Please try again.");
            setIsPending(false);
            return;
          }

          if (!inventory.availableForSale) {
            setError("This item just sold out");
            setIsPending(false);
            return;
          }

          if (inventory.quantityAvailable === 0) {
            setError("This item is no longer available");
            setIsPending(false);
            return;
          }

          await addLine(variantId, 1);
          setIsPending(false);
          openCart();
        }}
        size="lg"
      >
        {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
        Add to Cart
        {!isPending && <ArrowRight className="ml-2 size-4" />}
      </Button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
