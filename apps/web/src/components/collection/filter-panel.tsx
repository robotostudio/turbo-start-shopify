"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Input } from "@workspace/ui/components/input";
import {
  type ReadonlyURLSearchParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useCallback, useState } from "react";

import type { ShopifyFilter } from "@/lib/shopify/types";

type FilterPanelProps = {
  filters: ShopifyFilter[];
};

export function FilterPanel({ filters }: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string, add: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("after");

      if (add) {
        params.append(key, value);
      } else {
        // Remove specific value for multi-value params
        const all = params.getAll(key).filter((v) => v !== value);
        params.delete(key);
        for (const v of all) {
          params.append(key, v);
        }
      }

      const qs = params.toString();
      router.push(qs ? `?${qs}` : pathname);
    },
    [router, pathname, searchParams]
  );

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("after");

      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      const qs = params.toString();
      router.push(qs ? `?${qs}` : pathname);
    },
    [router, pathname, searchParams]
  );

  // Find specific filter sections from Shopify's response
  const availabilityFilter = filters.find((f) => f.label === "Availability");
  const priceFilter = filters.find((f) => f.label === "Price");
  const vendorFilter = filters.find(
    (f) => f.label === "Product vendor" || f.label === "Vendor"
  );
  const typeFilter = filters.find(
    (f) => f.label === "Product type" || f.label === "Type"
  );
  const tagFilter = filters.find((f) => f.label === "Tag");

  const defaultOpen = [
    availabilityFilter && "availability",
    priceFilter && "price",
    vendorFilter && "vendor",
    typeFilter && "type",
    tagFilter && "tag",
  ].filter(Boolean) as string[];

  return (
    <div>
      <Accordion type="multiple" defaultValue={defaultOpen}>
        {availabilityFilter && (
          <AvailabilitySection
            filter={availabilityFilter}
            searchParams={searchParams}
            onToggle={(checked) =>
              setParam("filter.available", checked ? "true" : null)
            }
          />
        )}

        {priceFilter && (
          <PriceSection
            key={`${searchParams.get("filter.price.min") ?? ""}-${searchParams.get("filter.price.max") ?? ""}`}
            searchParams={searchParams}
            onApply={(min, max) => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete("after");
              if (min) {
                params.set("filter.price.min", min);
              } else {
                params.delete("filter.price.min");
              }
              if (max) {
                params.set("filter.price.max", max);
              } else {
                params.delete("filter.price.max");
              }
              const qs = params.toString();
              router.push(qs ? `?${qs}` : pathname);
            }}
          />
        )}

        {vendorFilter && vendorFilter.values.length > 0 && (
          <CheckboxSection
            value="vendor"
            label="Vendor"
            filterValues={vendorFilter.values}
            paramKey="filter.vendor"
            searchParams={searchParams}
            onToggle={updateParam}
          />
        )}

        {typeFilter && typeFilter.values.length > 0 && (
          <CheckboxSection
            value="type"
            label="Product Type"
            filterValues={typeFilter.values}
            paramKey="filter.type"
            searchParams={searchParams}
            onToggle={updateParam}
          />
        )}

        {tagFilter && tagFilter.values.length > 0 && (
          <CheckboxSection
            value="tag"
            label="Tag"
            filterValues={tagFilter.values}
            paramKey="filter.tag"
            searchParams={searchParams}
            onToggle={updateParam}
          />
        )}
      </Accordion>
    </div>
  );
}

function AvailabilitySection({
  filter,
  searchParams,
  onToggle,
}: {
  filter: ShopifyFilter;
  searchParams: ReadonlyURLSearchParams;
  onToggle: (checked: boolean) => void;
}) {
  const isChecked = searchParams.get("filter.available") === "true";
  const inStockValue = filter.values.find((v) => {
    try {
      const input = JSON.parse(v.input);
      return input.available === true;
    } catch {
      return false;
    }
  });

  return (
    <AccordionItem value="availability">
      <AccordionTrigger className="hover:no-underline">Availability</AccordionTrigger>
      <AccordionContent>
        <label htmlFor="filter-available" className="flex cursor-pointer items-center gap-3">
          <Checkbox
            id="filter-available"
            checked={isChecked}
            onCheckedChange={(checked) => onToggle(checked === true)}
            className="size-4 rounded-none"
          />
          <span className="text-sm">In Stock</span>
          {inStockValue && (
            <span className="text-muted-foreground text-xs">
              ({inStockValue.count})
            </span>
          )}
        </label>
      </AccordionContent>
    </AccordionItem>
  );
}

function PriceSection({
  searchParams,
  onApply,
}: {
  searchParams: ReadonlyURLSearchParams;
  onApply: (min: string, max: string) => void;
}) {
  const [min, setMin] = useState(searchParams.get("filter.price.min") ?? "");
  const [max, setMax] = useState(searchParams.get("filter.price.max") ?? "");

  return (
    <AccordionItem value="price">
      <AccordionTrigger className="hover:no-underline">Price</AccordionTrigger>
      <AccordionContent>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            min={0}
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="h-8 rounded-none text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
          />
          <span className="text-muted-foreground text-sm">–</span>
          <Input
            type="number"
            placeholder="Max"
            min={0}
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="h-8 rounded-none text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
          />
        </div>
        <Button
          size="lg"
          onClick={() => onApply(min, max)}
          className="mt-3 w-full rounded-none border border-foreground bg-transparent text-foreground text-xs tracking-wider hover:bg-foreground hover:text-background"
        >
          Apply
        </Button>
      </AccordionContent>
    </AccordionItem>
  );
}

function CheckboxSection({
  value,
  label,
  filterValues,
  paramKey,
  searchParams,
  onToggle,
}: {
  value: string;
  label: string;
  filterValues: ShopifyFilter["values"];
  paramKey: string;
  searchParams: ReadonlyURLSearchParams;
  onToggle: (key: string, value: string, add: boolean) => void;
}) {
  const activeValues = new Set(searchParams.getAll(paramKey));

  return (
    <AccordionItem value={value}>
      <AccordionTrigger className="hover:no-underline">{label}</AccordionTrigger>
      <AccordionContent>
        <div className="flex flex-col gap-2">
          {filterValues.map((fv) => {
            // Extract the actual value from the Shopify filter input JSON
            let filterLabel = fv.label;
            try {
              const input = JSON.parse(fv.input);
              // Shopify returns { productVendor: "X" } or { productType: "X" } or { tag: "X" }
              const val = input.productVendor ?? input.productType ?? input.tag;
              if (val) filterLabel = val;
            } catch {
              // Use label as fallback
            }

            const isChecked = activeValues.has(filterLabel);

            const checkboxId = `filter-${paramKey}-${fv.id}`;

            return (
              <label
                key={fv.id}
                htmlFor={checkboxId}
                className="flex cursor-pointer items-center gap-3"
              >
                <Checkbox
                  id={checkboxId}
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    onToggle(paramKey, filterLabel, checked === true)
                  }
                  className="size-4 rounded-none"
                />
                <span className="text-sm">{fv.label}</span>
                <span className="text-muted-foreground text-xs">
                  ({fv.count})
                </span>
              </label>
            );
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
