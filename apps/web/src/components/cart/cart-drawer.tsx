"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { ShoppingBag } from "lucide-react";

import { useCart } from "./cart-context";
import { CartLineItem } from "./cart-line-item";
import { CartSummary } from "./cart-summary";

export function CartDrawer() {
  const { cart, isCartOpen, closeCart } = useCart();

  const lines = cart?.lines.edges.map((e) => e.node) ?? [];

  return (
    <Sheet onOpenChange={(open) => !open && closeCart()} open={isCartOpen}>
      <SheetContent className="flex flex-col" side="right">
        <SheetHeader>
          <SheetTitle>Cart</SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <ShoppingBag className="size-12 text-muted-foreground" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button onClick={closeCart} variant="outline">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="-mx-6 flex-1 overflow-y-auto px-6">
              <div className="divide-y">
                {lines.map((line) => (
                  <CartLineItem key={line.id} line={line} />
                ))}
              </div>
            </div>

            {cart && (
              <SheetFooter className="flex-col gap-3 p-0">
                <CartSummary cart={cart} />
                <Button
                  className="w-full"
                  onClick={() => {
                    window.location.href = cart.checkoutUrl;
                  }}
                  size="lg"
                >
                  Checkout
                </Button>
                <Button
                  className="w-full"
                  onClick={closeCart}
                  size="lg"
                  variant="outline"
                >
                  Continue Shopping
                </Button>
              </SheetFooter>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
