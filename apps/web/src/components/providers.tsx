"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { PropsWithChildren } from "react";

import { CartProvider } from "./cart/cart-context";
import { SavedItemsProvider } from "./saved-items/saved-items-context";

const queryClient = new QueryClient();

export function Providers({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <SavedItemsProvider>
          <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            disableTransitionOnChange
            enableColorScheme
            enableSystem
          >
            {children}
          </NextThemesProvider>
        </SavedItemsProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}
