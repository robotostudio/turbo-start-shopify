"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import type { ShopifyProductOption, ShopifyVariant } from "@/lib/shopify/types";
import { getOptionAvailability } from "@/lib/shopify/variant-utils";
import { ColorSwatch } from "./color-swatch";
import { SizeSelector } from "./size-selector";

type VariantSelectorProps = {
  options: ShopifyProductOption[];
  variants: ShopifyVariant[];
  handle: string;
};

/** Option names that render as color swatches. */
const COLOR_OPTION_NAMES = new Set(["color", "colour"]);

/** Option names that render as size buttons. */
const SIZE_OPTION_NAMES = new Set(["size"]);

function getOptionType(name: string): "color" | "size" | "default" {
  const lower = name.toLowerCase();
  if (COLOR_OPTION_NAMES.has(lower)) return "color";
  if (SIZE_OPTION_NAMES.has(lower)) return "size";
  return "default";
}

export function VariantSelector({
  options,
  variants,
  handle,
}: VariantSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const defaultVariant = variants[0];
  const currentSelections: Record<string, string> = {};
  for (const option of options) {
    const fromUrl = searchParams.get(option.name);
    const fallback =
      defaultVariant?.selectedOptions.find((o) => o.name === option.name)
        ?.value ?? "";
    currentSelections[option.name] = fromUrl ?? fallback;
  }

  const handleSelect = useCallback(
    (optionName: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(optionName, value);
      router.replace(`/products/${handle}?${params.toString()}`, {
        scroll: false,
      });
    },
    [searchParams, router, handle]
  );

  if (options.length === 0) return null;

  return (
    <div className="space-y-4">
      {options.map((option) => {
        const availability = getOptionAvailability(
          variants,
          option.name,
          currentSelections
        );
        const selected = currentSelections[option.name];
        const optionType = getOptionType(option.name);

        return (
          <div key={option.id}>
            <p className="my-6 text-sm">
              {option.name}
              {selected && (
                <>
                  : <span className="font-semibold">{selected}</span>
                </>
              )}
            </p>

            {optionType === "color" ? (
              <ColorSwatch
                availability={availability}
                onSelect={(v) => handleSelect(option.name, v)}
                selectedValue={selected ?? ""}
                values={option.values}
              />
            ) : optionType === "size" ? (
              <SizeSelector
                availability={availability}
                onSelect={(v) => handleSelect(option.name, v)}
                selectedValue={selected ?? ""}
                values={option.values}
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const isAvailable = availability[value] !== false;
                  const isSelected = selected === value;

                  return (
                    <button
                      className={cn(
                        "border px-4 py-2 text-sm transition-colors",
                        isSelected
                          ? "border-foreground text-foreground"
                          : "border-border text-foreground hover:border-foreground/50",
                        !isAvailable && "opacity-40"
                      )}
                      key={value}
                      onClick={() => handleSelect(option.name, value)}
                      type="button"
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
