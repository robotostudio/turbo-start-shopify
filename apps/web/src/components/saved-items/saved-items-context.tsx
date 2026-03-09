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
