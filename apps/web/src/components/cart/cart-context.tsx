"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  addToCart,
  getCart,
  removeCartLine,
  updateCartLine,
} from "@/app/cart/actions";
import type { Cart } from "@/lib/shopify/types";

type CartContextValue = {
  cart: Cart | null;
  isLoading: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addLine: (variantId: string, quantity: number) => Promise<void>;
  updateLine: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const existingCart = await getCart();
      if (existingCart) {
        setCart(existingCart);
      }
    });
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addLine = useCallback(async (variantId: string, quantity: number) => {
    startTransition(async () => {
      const result = await addToCart([{ merchandiseId: variantId, quantity }]);
      if (result.ok) {
        setCart(result.cart);
      }
    });
  }, []);

  const updateLine = useCallback(async (lineId: string, quantity: number) => {
    startTransition(async () => {
      const result = await updateCartLine(lineId, quantity);
      if (result.ok) {
        setCart(result.cart);
      }
    });
  }, []);

  const removeLine = useCallback(async (lineId: string) => {
    startTransition(async () => {
      const result = await removeCartLine(lineId);
      if (result.ok) {
        setCart(result.cart);
      }
    });
  }, []);

  const value = useMemo(
    () => ({
      cart,
      isLoading,
      isCartOpen,
      openCart,
      closeCart,
      addLine,
      updateLine,
      removeLine,
    }),
    [
      cart,
      isLoading,
      isCartOpen,
      openCart,
      closeCart,
      addLine,
      updateLine,
      removeLine,
    ]
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
