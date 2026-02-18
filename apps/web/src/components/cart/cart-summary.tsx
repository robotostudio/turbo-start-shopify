"use client";

import { formatMoney } from "@/lib/shopify/money";
import type { Cart } from "@/lib/shopify/types";

export function CartSummary({ cart }: { cart: Cart }) {
  return (
    <div className="space-y-2 border-t pt-4">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium">
          {formatMoney(cart.cost.subtotalAmount)}
        </span>
      </div>
      {cart.cost.totalTaxAmount &&
        Number.parseFloat(cart.cost.totalTaxAmount.amount) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span>{formatMoney(cart.cost.totalTaxAmount)}</span>
          </div>
        )}
      <p className="text-muted-foreground text-xs">
        Shipping calculated at checkout
      </p>
    </div>
  );
}
