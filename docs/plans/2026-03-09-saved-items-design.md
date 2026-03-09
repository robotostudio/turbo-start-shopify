# Saved Items Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add "Saved Items" functionality with heart icon on product cards/PDP, navbar indicator, and a dedicated `/saved` page — localStorage-based, guest-friendly.

**Architecture:** Client-side localStorage stores an array of product handles. A `SavedItemsContext` (mirroring `CartContext` pattern) provides `toggle`, `remove`, `isInSavedItems`, `items`, `count`. A standalone `SavedItemButton` ("use client") renders as an absolute-positioned heart icon over any product card image — works as a client island inside server components. The `/saved` page fetches product data from a new API route that queries Shopify by handles.

**Tech Stack:** React Context, localStorage, lucide-react (`Heart`), Tailwind CSS transitions, Shopify Storefront API, TanStack Query (already installed).

---

## Task 1: Shopify Query + Types for fetching products by handles

**Files:**
- Modify: `apps/web/src/lib/shopify/queries.ts` (append new query)
- Modify: `apps/web/src/lib/shopify/types.ts` (append response type)

**Step 1: Add GraphQL query**

Append to `apps/web/src/lib/shopify/queries.ts`:

```ts
export const PRODUCTS_BY_HANDLES_QUERY = /* graphql */ `
  query ProductsByHandles($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          handle
          title
          vendor
          productType
          featuredImage {
            url
            altText
            width
            height
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                availableForSale
              }
            }
          }
        }
      }
    }
  }
`;
```

**Step 2: Add response type**

Append to `apps/web/src/lib/shopify/types.ts`:

```ts
export type ProductsByHandlesResponse = {
  products: Connection<ShopifyCollectionProduct>;
};
```

**Step 3: Verify**

Run: `pnpm check-types`
Expected: PASS

**Step 4: Commit**

```bash
git add apps/web/src/lib/shopify/queries.ts apps/web/src/lib/shopify/types.ts
git commit -m "feat: add Shopify query for fetching products by handles"
```

---

## Task 2: SavedItemsContext — Provider + Hook

**Files:**
- Create: `apps/web/src/components/saved-items/saved-items-context.tsx`

**Step 1: Create context**

Create `apps/web/src/components/saved-items/saved-items-context.tsx`:

```tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "saved-items";

type SavedItemsContextValue = {
  items: string[];
  count: number;
  toggle: (handle: string) => void;
  remove: (handle: string) => void;
  isInSavedItems: (handle: string) => boolean;
};

const SavedItemsContext = createContext<SavedItemsContextValue | null>(null);

function readFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function writeToStorage(items: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or unavailable — fail silently
  }
}

export function SavedItemsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setItems(readFromStorage());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      writeToStorage(items);
    }
  }, [items, isHydrated]);

  const toggle = useCallback((handle: string) => {
    setItems((prev) =>
      prev.includes(handle)
        ? prev.filter((h) => h !== handle)
        : [...prev, handle]
    );
  }, []);

  const remove = useCallback((handle: string) => {
    setItems((prev) => prev.filter((h) => h !== handle));
  }, []);

  const isInSavedItems = useCallback(
    (handle: string) => items.includes(handle),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      toggle,
      remove,
      isInSavedItems,
    }),
    [items, toggle, remove, isInSavedItems]
  );

  return <SavedItemsContext value={value}>{children}</SavedItemsContext>;
}

export function useSavedItems(): SavedItemsContextValue {
  const context = useContext(SavedItemsContext);
  if (!context) {
    throw new Error("useSavedItems must be used within a SavedItemsProvider");
  }
  return context;
}
```

**Step 2: Verify**

Run: `pnpm check-types`
Expected: PASS

**Step 3: Commit**

```bash
git add apps/web/src/components/saved-items/saved-items-context.tsx
git commit -m "feat: add SavedItemsContext with localStorage persistence"
```

---

## Task 3: SavedItemButton — Heart icon component

**Files:**
- Create: `apps/web/src/components/saved-items/saved-item-button.tsx`

**Step 1: Create component**

Create `apps/web/src/components/saved-items/saved-item-button.tsx`:

```tsx
"use client";

import { Heart } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";

import { useSavedItems } from "./saved-items-context";

type SavedItemButtonProps = {
  handle: string;
  className?: string;
};

export function SavedItemButton({ handle, className }: SavedItemButtonProps) {
  const { toggle, isInSavedItems } = useSavedItems();
  const isSaved = isInSavedItems(handle);

  return (
    <button
      aria-label={isSaved ? "Remove from saved items" : "Save for later"}
      className={cn(
        "group/heart flex size-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-all hover:bg-background hover:scale-110 active:scale-95",
        className
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(handle);
      }}
      type="button"
    >
      <Heart
        className={cn(
          "size-4 transition-colors",
          isSaved
            ? "fill-red-500 text-red-500"
            : "fill-transparent text-foreground group-hover/heart:text-red-500"
        )}
      />
    </button>
  );
}
```

**Design notes:**
- `e.preventDefault()` + `e.stopPropagation()` prevents parent Link navigation
- `bg-background/80 backdrop-blur-sm` — semi-transparent pill matching common ecom pattern
- `hover:scale-110 active:scale-95` — micro-interaction (scale up on hover, press effect)
- Red fill when saved, outline when not — industry standard heart toggle
- `group/heart` scoping prevents conflict with parent `group` (product card hover)
- `prefers-reduced-motion` handled by Tailwind's built-in motion reduction

**Step 2: Verify**

Run: `pnpm check-types`
Expected: PASS

**Step 3: Commit**

```bash
git add apps/web/src/components/saved-items/saved-item-button.tsx
git commit -m "feat: add SavedItemButton heart icon component"
```

---

## Task 4: Wire SavedItemsProvider into app

**Files:**
- Modify: `apps/web/src/components/providers.tsx`

**Step 1: Add provider**

Import `SavedItemsProvider` and nest it inside `CartProvider`:

```tsx
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
```

**Step 2: Verify**

Run: `pnpm check-types`
Expected: PASS

**Step 3: Commit**

```bash
git add apps/web/src/components/providers.tsx
git commit -m "feat: wire SavedItemsProvider into app providers"
```

---

## Task 5: Add heart to ProductCard

**Files:**
- Modify: `apps/web/src/components/product/product-card.tsx`

**Step 1: Add heart overlay**

The ProductCard is used in search results and related products. It's NOT a "use client" component, but it can render client component children. However, since the entire card is a `<Link>`, we need to restructure the standard variant to wrap in a `<div>` with the SavedItemButton outside the Link.

Updated `product-card.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";

import { SavedItemButton } from "@/components/saved-items/saved-item-button";

type ProductCardProps = {
  slug: string;
  title: string;
  priceRange: { minVariantPrice: number; maxVariantPrice: number };
  imageUrl: string | null;
  vendor?: string | null;
  mini?: boolean;
};

export function ProductCard({
  slug,
  title,
  priceRange,
  imageUrl,
  vendor,
  mini,
}: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceRange.minVariantPrice);

  const showRange = priceRange.minVariantPrice !== priceRange.maxVariantPrice;

  if (mini) {
    return (
      <Link
        className="flex items-center gap-3 p-2 transition-colors hover:bg-accent"
        href={`/products/${slug}`}
      >
        {imageUrl ? (
          <div className="relative size-12 shrink-0 overflow-hidden border">
            <Image
              alt={title}
              className="object-cover"
              fill
              sizes="48px"
              src={imageUrl}
            />
          </div>
        ) : (
          <div className="size-12 shrink-0 border bg-muted" />
        )}
        <div className="min-w-0">
          <p className="truncate font-medium text-sm">{title}</p>
          <p className="text-muted-foreground text-xs">
            {showRange ? `From ${formattedPrice}` : formattedPrice}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <div className="group relative">
      <Link className="block space-y-3" href={`/products/${slug}`}>
        <div className="relative aspect-3/4 overflow-hidden bg-muted">
          {imageUrl ? (
            <Image
              alt={title}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              src={imageUrl}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              No image
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="font-normal text-sm leading-tight">{title}</h3>
          {vendor && (
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {vendor}
            </p>
          )}
          <p className="font-normal text-sm">
            {showRange ? `From ${formattedPrice}` : formattedPrice}
          </p>
        </div>
      </Link>
      <SavedItemButton
        className="absolute top-2 right-2 z-10 opacity-0 transition-opacity group-hover:opacity-100 data-[saved=true]:opacity-100"
        handle={slug}
      />
    </div>
  );
}
```

**Note:** The heart shows on hover (opacity-0 → group-hover:opacity-100) and stays visible when saved. The `data-[saved=true]` attribute needs to be added to SavedItemButton for this. Actually, we'll use a simpler approach — the button is always rendered but opacity-0 on desktop until hover. On mobile (touch), there's no hover, so we'll use `md:opacity-0 md:group-hover:opacity-100` to keep it always visible on mobile.

Update the className in the component to: `"absolute top-2 right-2 z-10 md:opacity-0 md:group-hover:opacity-100 transition-opacity"`

But we also need it visible when saved. We'll handle this by passing the saved state via a data attribute. Update `SavedItemButton` to add `data-saved={isSaved}` on the outer button, and use `md:data-[saved=true]:opacity-100` in the card.

**Step 2: Update SavedItemButton to expose saved state as data attribute**

In `saved-item-button.tsx`, add to the button element:
```tsx
data-saved={isSaved}
```

And update the className in product-card.tsx to:
```
"absolute top-2 right-2 z-10 md:opacity-0 md:group-hover:opacity-100 md:data-[saved=true]:opacity-100 transition-opacity"
```

**Step 3: Verify**

Run: `pnpm check-types`
Expected: PASS

**Step 4: Visual verification**

Open http://localhost:3000, check product cards show heart on hover, toggle works.

**Step 5: Commit**

```bash
git add apps/web/src/components/product/product-card.tsx apps/web/src/components/saved-items/saved-item-button.tsx
git commit -m "feat: add heart icon to product cards"
```

---

## Task 6: Add heart to ProductGrid (collections)

**Files:**
- Modify: `apps/web/src/components/collection/product-grid.tsx`

**Step 1: Add heart overlay**

The ProductGrid renders inline product cards. Add the SavedItemButton the same way — wrap each product in a `<div className="group relative">`, move the `<Link>` inside, add the heart outside.

Updated `product-grid.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";

import { SavedItemButton } from "@/components/saved-items/saved-item-button";
import { formatMoney } from "@/lib/shopify/money";
import type { ShopifyCollectionProduct } from "@/lib/shopify/types";

type ProductGridProps = {
  products: ShopifyCollectionProduct[];
};

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        No products found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
      {products.map((product) => (
        <div className="group relative" key={product.id}>
          <Link
            className="block space-y-3"
            href={`/products/${product.handle}`}
          >
            <div className="relative aspect-3/4 overflow-hidden bg-muted">
              {product.featuredImage ? (
                <Image
                  alt={product.featuredImage.altText ?? product.title}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                  src={product.featuredImage.url}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                  No image
                </div>
              )}
            </div>
            <div className="space-y-1">
              <h3 className="font-normal text-sm leading-tight">
                {product.title}
              </h3>
              {product.vendor && (
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {product.vendor}
                </p>
              )}
              <p className="font-normal text-sm">
                {formatMoney(product.priceRange.minVariantPrice)}
              </p>
            </div>
          </Link>
          <SavedItemButton
            className="absolute top-2 right-2 z-10 md:opacity-0 md:group-hover:opacity-100 md:data-[saved=true]:opacity-100 transition-opacity"
            handle={product.handle}
          />
        </div>
      ))}
    </div>
  );
}
```

**Step 2: Verify**

Run: `pnpm check-types`
Expected: PASS

**Step 3: Visual verification**

Open http://localhost:3000/collections/all-products, check hearts appear.

**Step 4: Commit**

```bash
git add apps/web/src/components/collection/product-grid.tsx
git commit -m "feat: add heart icon to collection product grid"
```

---

## Task 7: Add heart to FeaturedProducts

**Files:**
- Modify: `apps/web/src/components/home/featured-products.tsx`

**Step 1: Add heart overlay**

FeaturedProducts is a server component (async). The SavedItemButton is a "use client" component — it can be rendered as a client island inside a server component.

Wrap each product card in a `<div className="group relative">`, nest the existing `<Link>` inside, add SavedItemButton outside.

Updated inline `ProductCard` function:

```tsx
function ProductCard({ product }: { product: FeaturedProduct }) {
  return (
    <div className="group relative">
      <Link className="block" href={`/products/${product.handle}`}>
        <div className="relative aspect-3/4 overflow-hidden bg-background">
          {product.featuredImage ? (
            <Image
              alt={product.featuredImage.altText ?? product.title}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              src={product.featuredImage.url}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-400 text-sm">
              No image
            </div>
          )}
        </div>
        <div className="mt-4 space-y-1">
          <h3 className="font-normal text-sm tracking-wide">
            {product.title}
          </h3>
          {product.vendor && (
            <p className="text-neutral-500 text-xs tracking-wider uppercase">
              {product.vendor}
            </p>
          )}
          <p className="text-sm">
            {formatMoney(product.priceRange.minVariantPrice)}
          </p>
        </div>
      </Link>
      <SavedItemButton
        className="absolute top-2 right-2 z-10 md:opacity-0 md:group-hover:opacity-100 md:data-[saved=true]:opacity-100 transition-opacity"
        handle={product.handle}
      />
    </div>
  );
}
```

Add import at top:
```tsx
import { SavedItemButton } from "@/components/saved-items/saved-item-button";
```

**Step 2: Verify**

Run: `pnpm check-types`
Expected: PASS

**Step 3: Visual verification**

Open http://localhost:3000, scroll to Featured Products, check hearts.

**Step 4: Commit**

```bash
git add apps/web/src/components/home/featured-products.tsx
git commit -m "feat: add heart icon to featured products"
```

---

## Task 8: Add heart to Product Detail Page

**Files:**
- Modify: `apps/web/src/app/products/[handle]/page.tsx`

**Step 1: Add SavedItemButton next to Add to Cart**

In the PDP, add the heart button next to the Add to Cart button. Wrap them in a flex container:

In `ProductPage` component, replace the standalone `<AddToCart>` with:

```tsx
{/* Add to Cart + Save */}
<div className="flex gap-3">
  <div className="flex-1">
    <AddToCart
      availableForSale={selectedVariant.availableForSale}
      variantId={selectedVariant.id}
    />
  </div>
  <SavedItemButton
    className="flex size-12 shrink-0 items-center justify-center border border-border transition-colors hover:bg-accent"
    handle={handle}
  />
</div>
```

Add import:
```tsx
import { SavedItemButton } from "@/components/saved-items/saved-item-button";
```

**Design note:** On PDP, the heart is a bordered square button sitting next to the full-width Add to Cart. This follows the Nike/Adidas pattern of a dedicated save action next to the primary CTA.

**Step 2: Verify**

Run: `pnpm check-types`
Expected: PASS

**Step 3: Visual verification**

Open http://localhost:3000/products/[any-handle], verify heart appears next to Add to Cart.

**Step 4: Commit**

```bash
git add apps/web/src/app/products/[handle]/page.tsx
git commit -m "feat: add save button to product detail page"
```

---

## Task 9: SavedItemsToggle — Navbar indicator

**Files:**
- Create: `apps/web/src/components/saved-items/saved-items-toggle.tsx`

**Step 1: Create component**

Mirrors `CartToggle` exactly. Heart icon with count badge.

```tsx
"use client";

import { Button } from "@workspace/ui/components/button";
import { Heart } from "lucide-react";
import Link from "next/link";

import { useSavedItems } from "./saved-items-context";

export function SavedItemsToggle() {
  const { count } = useSavedItems();

  return (
    <Button
      aria-label={`Saved items${count > 0 ? ` (${count} items)` : ""}`}
      asChild
      className="relative"
      size="icon"
      variant="ghost"
    >
      <Link href="/saved">
        <Heart className="size-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Link>
    </Button>
  );
}
```

**Design note:** Uses `<Link>` instead of `onClick` — navigates to `/saved` page. This follows the West Elm/ASOS pattern where the navbar heart links to the saved items page.

**Step 2: Verify**

Run: `pnpm check-types`
Expected: PASS

**Step 3: Commit**

```bash
git add apps/web/src/components/saved-items/saved-items-toggle.tsx
git commit -m "feat: add SavedItemsToggle navbar indicator"
```

---

## Task 10: Add SavedItemsToggle to Navbar

**Files:**
- Modify: `apps/web/src/components/navbar.tsx`

**Step 1: Add to desktop + mobile actions**

Import:
```tsx
import { SavedItemsToggle } from "./saved-items/saved-items-toggle";
```

In **Desktop Actions** section (around line 215), add `<SavedItemsToggle />` between the Search link and `<CartToggle />`:

```tsx
{/* Desktop Actions */}
<div className="hidden flex-1 items-center justify-end gap-4 md:flex">
  <Link
    aria-label="Search"
    className="inline-flex size-9 items-center justify-center rounded-md transition-colors hover:text-foreground"
    href="/search"
  >
    <Search className="size-4" />
  </Link>
  <SavedItemsToggle />
  <CartToggle />
</div>
```

In **Mobile Actions** section (around line 232), add `<SavedItemsToggle />` between Search and CartToggle:

```tsx
{/* Mobile Actions */}
<div className="flex items-center gap-2 md:hidden">
  <Link
    aria-label="Search"
    className="inline-flex size-9 items-center justify-center rounded-md transition-colors hover:text-foreground"
    href="/search"
  >
    <Search className="size-4" />
  </Link>
  <SavedItemsToggle />
  <CartToggle />
  <MobileMenu navbarData={navbarData} settingsData={settingsData} />
</div>
```

**Step 2: Verify**

Run: `pnpm check-types`
Expected: PASS

**Step 3: Visual verification**

Check navbar — heart icon between search and cart, badge shows count.

**Step 4: Commit**

```bash
git add apps/web/src/components/navbar.tsx
git commit -m "feat: add saved items indicator to navbar"
```

---

## Task 11: API route for fetching saved products

**Files:**
- Create: `apps/web/src/app/api/saved-items/route.ts`

**Step 1: Create route**

```ts
import { storefrontQuery } from "@/lib/shopify/client";
import { PRODUCTS_BY_HANDLES_QUERY } from "@/lib/shopify/queries";
import type { ProductsByHandlesResponse } from "@/lib/shopify/types";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handles = searchParams.get("handles");

  if (!handles) {
    return NextResponse.json({ products: [] });
  }

  const handleList = handles.split(",").filter(Boolean);
  if (handleList.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const query = handleList.map((h) => `handle:${h}`).join(" OR ");

  const result = await storefrontQuery<ProductsByHandlesResponse>(
    PRODUCTS_BY_HANDLES_QUERY,
    { variables: { query, first: handleList.length } }
  );

  if (!result.ok) {
    return NextResponse.json({ products: [] }, { status: 500 });
  }

  const products = result.data.products.edges.map((e) => e.node);
  return NextResponse.json({ products });
}
```

**Step 2: Verify**

Run: `pnpm check-types`
Expected: PASS

**Step 3: Commit**

```bash
git add apps/web/src/app/api/saved-items/route.ts
git commit -m "feat: add API route for fetching saved products by handles"
```

---

## Task 12: Saved Items page (/saved)

**Files:**
- Create: `apps/web/src/app/saved/page.tsx`

**Step 1: Create page**

```tsx
"use client";

import { Button } from "@workspace/ui/components/button";
import { useQuery } from "@tanstack/react-query";
import { Heart, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useCart } from "@/components/cart/cart-context";
import { SavedItemButton } from "@/components/saved-items/saved-item-button";
import { useSavedItems } from "@/components/saved-items/saved-items-context";
import { formatMoney } from "@/lib/shopify/money";
import type { ShopifyCollectionProduct } from "@/lib/shopify/types";

type SavedProductsResponse = {
  products: ShopifyCollectionProduct[];
};

async function fetchSavedProducts(
  handles: string[]
): Promise<ShopifyCollectionProduct[]> {
  if (handles.length === 0) return [];
  const response = await fetch(
    `/api/saved-items?handles=${handles.join(",")}`
  );
  if (!response.ok) return [];
  const data: SavedProductsResponse = await response.json();
  return data.products;
}

function SavedProductCard({
  product,
}: {
  product: ShopifyCollectionProduct;
}) {
  const { addLine, openCart } = useCart();
  const firstVariant = product.variants.edges[0]?.node;

  return (
    <div className="group relative">
      <Link className="block space-y-3" href={`/products/${product.handle}`}>
        <div className="relative aspect-3/4 overflow-hidden bg-muted">
          {product.featuredImage ? (
            <Image
              alt={product.featuredImage.altText ?? product.title}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              src={product.featuredImage.url}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              No image
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="font-normal text-sm leading-tight">
            {product.title}
          </h3>
          {product.vendor && (
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {product.vendor}
            </p>
          )}
          <p className="font-normal text-sm">
            {formatMoney(product.priceRange.minVariantPrice)}
          </p>
        </div>
      </Link>
      <SavedItemButton
        className="absolute top-2 right-2 z-10"
        handle={product.handle}
      />
      {firstVariant?.availableForSale && (
        <Button
          className="mt-3 w-full rounded-none uppercase"
          onClick={async (e) => {
            e.preventDefault();
            await addLine(firstVariant.id, 1);
            openCart();
          }}
          size="sm"
          variant="outline"
        >
          <ShoppingBag className="mr-2 size-4" />
          Add to Bag
        </Button>
      )}
    </div>
  );
}

export default function SavedPage() {
  const { items, count } = useSavedItems();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["saved-items", items],
    queryFn: () => fetchSavedProducts(items),
    enabled: items.length > 0,
  });

  if (isLoading && count > 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="mb-8 font-semibold text-3xl">Saved Items</h1>
        <div className="flex items-center justify-center py-16">
          <div className="size-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        </div>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="mb-8 font-semibold text-3xl">Saved Items</h1>
        <div className="flex flex-col items-center justify-center gap-6 py-16">
          <Heart className="size-16 text-muted-foreground" />
          <div className="text-center">
            <p className="font-medium text-lg">No saved items yet</p>
            <p className="mt-1 text-muted-foreground text-sm">
              Tap the heart icon on any product to save it for later.
            </p>
          </div>
          <Button asChild>
            <Link href="/collections">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Sort products to match the order of items in localStorage
  const sortedProducts = items
    .map((handle) => products.find((p) => p.handle === handle))
    .filter((p): p is ShopifyCollectionProduct => p !== undefined);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-semibold text-3xl">Saved Items</h1>
        <p className="text-muted-foreground text-sm">
          {count} {count === 1 ? "item" : "items"}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {sortedProducts.map((product) => (
          <SavedProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Verify**

Run: `pnpm check-types`
Expected: PASS

**Step 3: Visual verification**

1. Save a few products via heart icons
2. Navigate to http://localhost:3000/saved
3. Verify grid shows saved products
4. Click heart to unsave — product disappears
5. Click "Add to Bag" — cart opens with product
6. Clear all — verify empty state

**Step 4: Commit**

```bash
git add apps/web/src/app/saved/page.tsx
git commit -m "feat: add saved items page with product grid and add to bag"
```

---

## Task 13: Final verification + format

**Step 1: Type check**

Run: `pnpm check-types`
Expected: PASS

**Step 2: Format**

Run: `pnpm format`

**Step 3: Lint**

Run: `pnpm lint`

**Step 4: Build**

Run: `pnpm build:web`
Expected: PASS — all pages generate successfully

**Step 5: Final commit (if format changed anything)**

```bash
git add -A
git commit -m "chore: format"
```

---

## Summary of files

**Created (5):**
- `apps/web/src/components/saved-items/saved-items-context.tsx`
- `apps/web/src/components/saved-items/saved-item-button.tsx`
- `apps/web/src/components/saved-items/saved-items-toggle.tsx`
- `apps/web/src/app/api/saved-items/route.ts`
- `apps/web/src/app/saved/page.tsx`

**Modified (6):**
- `apps/web/src/lib/shopify/queries.ts`
- `apps/web/src/lib/shopify/types.ts`
- `apps/web/src/components/providers.tsx`
- `apps/web/src/components/product/product-card.tsx`
- `apps/web/src/components/collection/product-grid.tsx`
- `apps/web/src/components/home/featured-products.tsx`
- `apps/web/src/app/products/[handle]/page.tsx`
- `apps/web/src/components/navbar.tsx`
