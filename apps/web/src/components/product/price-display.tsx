import { formatMoney } from "@/lib/shopify/money";
import type { MoneyV2 } from "@/lib/shopify/types";

type PriceDisplayProps = {
  price: MoneyV2;
  compareAtPrice: MoneyV2 | null;
};

export function PriceDisplay({ price, compareAtPrice }: PriceDisplayProps) {
  const isOnSale =
    compareAtPrice &&
    Number.parseFloat(compareAtPrice.amount) > Number.parseFloat(price.amount);

  const savePercent = isOnSale
    ? Math.round(
        ((Number.parseFloat(compareAtPrice.amount) -
          Number.parseFloat(price.amount)) /
          Number.parseFloat(compareAtPrice.amount)) *
          100
      )
    : 0;

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {isOnSale && savePercent > 0 && (
        <span className="inline-block bg-red-600 w-fit px-2 py-1 text-white text-sm uppercase">
          Save {savePercent}%
        </span>
      )}
      <div className="flex items-center gap-3">
        <span className="text-4xl">{formatMoney(price)}</span>
        {isOnSale && compareAtPrice && (
          <span className="text-lg text-muted-foreground line-through">
            {formatMoney(compareAtPrice)}
          </span>
        )}
      </div>
    </div>
  );
}
