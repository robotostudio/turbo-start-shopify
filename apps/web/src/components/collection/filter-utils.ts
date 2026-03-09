type ProductFilter = Record<string, unknown>;

/**
 * Parse URL search params into Shopify ProductFilter array.
 *
 * URL format:
 *   ?filter.available=true
 *   &filter.price.min=10&filter.price.max=100
 *   &filter.vendor=Nike&filter.vendor=Adidas
 *   &filter.type=Shoes
 *   &filter.tag=sale
 */
export function parseFilterParams(
  sp: URLSearchParams | Record<string, string | string[]>
): ProductFilter[] {
  const filters: ProductFilter[] = [];

  const getAll = (key: string): string[] => {
    if (sp instanceof URLSearchParams) {
      return sp.getAll(key);
    }
    const val = sp[key];
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  };

  const get = (key: string): string | null => {
    if (sp instanceof URLSearchParams) {
      return sp.get(key);
    }
    const val = sp[key];
    if (!val) return null;
    return Array.isArray(val) ? (val[0] ?? null) : val;
  };

  // Availability
  const available = get("filter.available");
  if (available === "true") {
    filters.push({ available: true });
  } else if (available === "false") {
    filters.push({ available: false });
  }

  // Price range
  const priceMin = get("filter.price.min");
  const priceMax = get("filter.price.max");
  if (priceMin || priceMax) {
    const price: Record<string, number> = {};
    if (priceMin) price.min = Number(priceMin);
    if (priceMax) price.max = Number(priceMax);
    filters.push({ price });
  }

  // Vendor (multiple values)
  for (const vendor of getAll("filter.vendor")) {
    filters.push({ productVendor: vendor });
  }

  // Product type (multiple values)
  for (const type of getAll("filter.type")) {
    filters.push({ productType: type });
  }

  // Tags (multiple values)
  for (const tag of getAll("filter.tag")) {
    filters.push({ tag });
  }

  return filters;
}

/** Count active filter params in URL search params. */
export function countActiveFilters(sp: URLSearchParams): number {
  let count = 0;
  for (const key of sp.keys()) {
    if (key.startsWith("filter.")) count++;
  }
  return count;
}

/** Build a description string for an active filter (used in chips). */
export type ActiveFilter = {
  key: string;
  label: string;
  paramKey: string;
  paramValue: string;
};

function buildFilterLabel(key: string, value: string): string {
  if (key === "filter.available")
    return value === "true" ? "In Stock" : "Out of Stock";
  if (key === "filter.price.min") return `Min: ${value}`;
  if (key === "filter.price.max") return `Max: ${value}`;
  return value;
}

function buildFilterKey(key: string, value: string): string {
  const prefix = key.replace("filter.", "");
  return `${prefix}-${value}`;
}

/** Extract active filters from URL search params for display. */
export function getActiveFilters(sp: URLSearchParams): ActiveFilter[] {
  const active: ActiveFilter[] = [];

  for (const [key, value] of sp.entries()) {
    if (!key.startsWith("filter.")) continue;
    active.push({
      key: buildFilterKey(key, value),
      label: buildFilterLabel(key, value),
      paramKey: key,
      paramValue: value,
    });
  }

  return active;
}

/** Remove a specific filter param+value from search params and return new string. */
export function removeFilterParam(
  sp: URLSearchParams,
  paramKey: string,
  paramValue: string
): string {
  const next = new URLSearchParams();
  for (const [key, value] of sp.entries()) {
    if (key === paramKey && value === paramValue) continue;
    next.append(key, value);
  }
  next.delete("after");
  return next.toString();
}

/** Remove all filter params from search params. */
export function clearAllFilters(sp: URLSearchParams): string {
  const next = new URLSearchParams();
  for (const [key, value] of sp.entries()) {
    if (key.startsWith("filter.")) continue;
    next.append(key, value);
  }
  next.delete("after");
  return next.toString();
}
