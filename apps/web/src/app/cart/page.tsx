"use client";

import { Button } from "@workspace/ui/components/button";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

import { CartLineItem } from "@/components/cart/cart-line-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { useCart } from "@/components/cart/cart-context";

export default function CartPage() {
  const { cart, isLoading } = useCart();

  const lines = cart?.lines.edges.map((e) => e.node) ?? [];

  if (isLoading && !cart) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="mb-8 font-semibold text-3xl">Cart</h1>
        <div className="flex items-center justify-center py-16">
          <div className="size-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="mb-8 font-semibold text-3xl">Cart</h1>
        <div className="flex flex-col items-center justify-center gap-6 py-16">
          <ShoppingBag className="size-16 text-muted-foreground" />
          <div className="text-center">
            <p className="font-medium text-lg">Your cart is empty</p>
            <p className="mt-1 text-muted-foreground text-sm">
              Add some items to get started.
            </p>
          </div>
          <Button asChild>
            <Link href="/collections">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="mb-8 font-semibold text-3xl">Cart</h1>
      <div className="grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="divide-y">
            {lines.map((line) => (
              <CartLineItem key={line.id} line={line} />
            ))}
          </div>
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link href="/collections">Continue Shopping</Link>
            </Button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border bg-card p-6">
            <h2 className="mb-4 font-semibold text-lg">Order Summary</h2>
            {cart && (
              <>
                <CartSummary cart={cart} />
                <Button
                  className="mt-4 w-full"
                  onClick={() => {
                    window.location.href = cart.checkoutUrl;
                  }}
                  size="lg"
                >
                  Checkout
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
