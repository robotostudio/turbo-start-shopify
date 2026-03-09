"use client";

import { cn } from "@workspace/ui/lib/utils";

type ColorSwatchProps = {
  values: string[];
  selectedValue: string;
  availability: Record<string, boolean>;
  onSelect: (value: string) => void;
};

/** Maps common color names to hex values for swatch display. */
const COLOR_MAP: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#eab308",
  orange: "#f97316",
  purple: "#a855f7",
  pink: "#ec4899",
  brown: "#92400e",
  gray: "#6b7280",
  grey: "#6b7280",
  navy: "#1e3a5f",
  beige: "#f5f5dc",
  cream: "#fffdd0",
  tan: "#d2b48c",
  olive: "#808000",
  teal: "#14b8a6",
  coral: "#ff7f50",
  gold: "#fbbf24",
  silver: "#c0c0c0",
  charcoal: "#36454f",
  ivory: "#fffff0",
  burgundy: "#800020",
  lavender: "#e9d5ff",
  maroon: "#800000",
  mint: "#98f5e1",
  peach: "#ffcba4",
  rust: "#b7410e",
  sage: "#bcb88a",
  sand: "#c2b280",
  slate: "#708090",
  wine: "#722f37",
  natural: "#f5f0e1",
};

function getColorHex(colorName: string): string | null {
  const lower = colorName.toLowerCase().trim();
  if (COLOR_MAP[lower]) return COLOR_MAP[lower];

  // Check if any key is contained in the color name
  for (const [key, hex] of Object.entries(COLOR_MAP)) {
    if (lower.includes(key)) return hex;
  }
  return null;
}

export function ColorSwatch({
  values,
  selectedValue,
  availability,
  onSelect,
}: ColorSwatchProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => {
        const hex = getColorHex(value);
        const isAvailable = availability[value] !== false;
        const isSelected = selectedValue === value;

        if (!hex) {
          // Fallback to text button if no matching color
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
              onClick={() => onSelect(value)}
              title={value}
              type="button"
            >
              {value}
            </button>
          );
        }

        return (
          <button
            className={cn(
              "relative size-10 rounded-full border transition-all",
              isSelected
                ? "border-foreground ring-1 ring-foreground/80 ring-offset-2 ring-offset-background"
                : "border-border hover:border-foreground/50",
              !isAvailable && "opacity-40"
            )}
            key={value}
            onClick={() => onSelect(value)}
            style={{ backgroundColor: hex }}
            title={value}
            type="button"
          >
            <span className="sr-only">{value}</span>
          </button>
        );
      })}
    </div>
  );
}
