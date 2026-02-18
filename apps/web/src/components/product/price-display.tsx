import { Badge } from "@workspace/ui/components/badge";

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

  return (
    <div className="flex items-center gap-2">
      <span className="font-semibold text-2xl">{formatMoney(price)}</span>
      {isOnSale && compareAtPrice && (
        <>
          <span className="text-lg text-muted-foreground line-through">
            {formatMoney(compareAtPrice)}
          </span>
          <Badge variant="secondary">Sale</Badge>
        </>
      )}
    </div>
  );
}
