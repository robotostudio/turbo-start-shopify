import Link from "next/link";

import { ShopifyImage } from "@/components/product/shopify-image";
import { formatOrderDate, orderIdToParam } from "@/lib/customer-account/format";
import type { OrderSummary } from "@/lib/customer-account/types";
import { formatMoney } from "@/lib/shopify/money";
import { OrderStatusBadge } from "./order-status-badge";

export function OrderSummaryRow({ order }: Readonly<{ order: OrderSummary }>) {
  const images = order.lineItems.nodes.filter((item) => item.image);
  return (
    <li>
      <Link
        className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
        href={`/account/orders/${orderIdToParam(order.id)}`}
      >
        <div className="-space-x-3 flex shrink-0">
          {images.map((item) =>
            item.image ? (
              <ShopifyImage
                alt={item.image.altText ?? item.name}
                className="size-12 rounded-md border-2 border-background bg-muted object-cover"
                height={48}
                key={item.id}
                src={item.image.url}
                width={48}
              />
            ) : null
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">Order {order.name}</p>
          <p className="text-muted-foreground text-sm">
            {formatOrderDate(order.processedAt)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="font-medium tabular-nums">
            {formatMoney(order.totalPrice)}
          </span>
          <OrderStatusBadge order={order} />
        </div>
      </Link>
    </li>
  );
}
