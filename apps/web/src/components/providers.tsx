"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { PropsWithChildren } from "react";

import { CartProvider } from "./cart/cart-context";

const queryClient = new QueryClient();

export function Providers({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableColorScheme
          enableSystem
        >
          {children}
        </NextThemesProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}
