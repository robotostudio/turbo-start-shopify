"use client";

import { cn } from "@workspace/ui/lib/utils";

type SizeSelectorProps = {
  values: string[];
  selectedValue: string;
  availability: Record<string, boolean>;
  onSelect: (value: string) => void;
};

export function SizeSelector({
  values,
  selectedValue,
  availability,
  onSelect,
}: SizeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => {
        const isAvailable = availability[value] !== false;
        const isSelected = selectedValue === value;

        return (
          <button
            className={cn(
              "min-w-14 border px-4 py-2.5 text-center text-sm font-medium transition-colors",
              isSelected
                ? "border-foreground bg-foreground text-background"
                : "border-border text-foreground hover:border-foreground/50",
              !isAvailable && "opacity-40 line-through"
            )}
            key={value}
            onClick={() => onSelect(value)}
            type="button"
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}
