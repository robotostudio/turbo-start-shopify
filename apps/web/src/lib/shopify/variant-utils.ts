import type { ShopifyVariant } from "./types";

/** Finds variant matching selected options map. */
export function findVariantByOptions(
  variants: ShopifyVariant[],
  selectedOptions: Record<string, string>
): ShopifyVariant | null {
  const entries = Object.entries(selectedOptions).filter(
    ([, value]) => value !== ""
  );
  if (entries.length === 0) return null;

  return (
    variants.find((variant) =>
      entries.every(([name, value]) =>
        variant.selectedOptions.some(
          (opt) => opt.name === name && opt.value === value
        )
      )
    ) ?? null
  );
}

/** Returns availability map: option value -> boolean, given current selections for other options. */
export function getOptionAvailability(
  variants: ShopifyVariant[],
  optionName: string,
  currentSelections: Record<string, string>
): Record<string, boolean> {
  const availability: Record<string, boolean> = {};

  const otherSelections = Object.entries(currentSelections).filter(
    ([name, value]) => name !== optionName && value !== ""
  );

  for (const variant of variants) {
    const optionValue = variant.selectedOptions.find(
      (opt) => opt.name === optionName
    )?.value;
    if (!optionValue) continue;

    const matchesOthers = otherSelections.every(([name, value]) =>
      variant.selectedOptions.some(
        (opt) => opt.name === name && opt.value === value
      )
    );

    if (matchesOthers && variant.availableForSale) {
      availability[optionValue] = true;
    } else if (!(optionValue in availability)) {
      availability[optionValue] = false;
    }
  }

  return availability;
}

/** Builds URL path with search params from selected options. */
export function buildVariantUrl(
  handle: string,
  selectedOptions: Record<string, string>
): string {
  const params = new URLSearchParams();
  for (const [name, value] of Object.entries(selectedOptions)) {
    if (value) {
      params.set(name, value);
    }
  }
  const qs = params.toString();
  return `/products/${handle}${qs ? `?${qs}` : ""}`;
}
