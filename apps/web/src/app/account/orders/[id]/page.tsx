import { Separator } from "@workspace/ui/components/separator";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { ShopifyImage } from "@/components/product/shopify-image";
import {
  formatOrderDate,
  humanizeStatus,
  orderParamToId,
} from "@/lib/customer-account/format";
import { loadCustomerData } from "@/lib/customer-account/load";
import { CUSTOMER_ORDER_QUERY } from "@/lib/customer-account/queries";
import type {
  CustomerOrder,
  OrderFulfillment,
} from "@/lib/customer-account/types";
import { getSEOMetadata } from "@/lib/seo";
import { formatMoney } from "@/lib/shopify/money";
import type { MoneyV2 } from "@/lib/shopify/types";

export async function generateMetadata() {
  return await getSEOMetadata({
    title: "Order details",
    description: "Order details and delivery status.",
    slug: "/account/orders",
    seoNoIndex: true,
  });
}

function TotalRow({
  label,
  money,
  strong = false,
}: Readonly<{
  label: string;
  money: MoneyV2 | null;
  strong?: boolean;
}>) {
  if (!money) return null;
  return (
    <div
      className={
        strong
          ? "flex justify-between font-medium"
          : "flex justify-between text-muted-foreground"
      }
    >
      <dt>{label}</dt>
      <dd className="tabular-nums">{formatMoney(money)}</dd>
    </div>
  );
}

function FulfillmentCard({
  fulfillment,
  index,
}: Readonly<{
  fulfillment: OrderFulfillment;
  index: number;
}>) {
  const status =
    fulfillment.latestShipmentStatus ?? fulfillment.status ?? "CONFIRMED";
  return (
    <li className="grid gap-2 rounded-lg border p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium">
          Shipment {index + 1}: {humanizeStatus(status)}
        </p>
        <p className="text-muted-foreground">
          {formatOrderDate(fulfillment.createdAt)}
        </p>
      </div>
      <ul className="text-muted-foreground">
        {fulfillment.fulfillmentLineItems.nodes.map((item) => (
          <li key={item.id}>
            {item.quantity} × {item.lineItem.name}
          </li>
        ))}
      </ul>
      {fulfillment.trackingInformation.map((tracking) => (
        <p key={tracking.number ?? tracking.url ?? tracking.company}>
          {tracking.company && `${tracking.company}: `}
          {tracking.url ? (
            <a
              className="underline underline-offset-4"
              href={tracking.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              {tracking.number ?? "Track shipment"}
            </a>
          ) : (
            tracking.number
          )}
        </p>
      ))}
    </li>
  );
}

export default async function AccountOrderPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const orderId = orderParamToId(id);
  if (!orderId) notFound();

  const { order } = await loadCustomerData<CustomerOrder>(
    CUSTOMER_ORDER_QUERY,
    `/account/orders/${id}`,
    { id: orderId }
  );
  // Another customer's order id resolves to null, not an error.
  if (!order) notFound();

  const fulfillments = order.fulfillments.nodes;

  return (
    <article className="grid gap-8">
      <div className="grid gap-2">
        <Link
          className="text-muted-foreground text-sm underline-offset-4 hover:underline"
          href="/account/orders"
        >
          ← All orders
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-medium text-xl">Order {order.name}</h2>
          <OrderStatusBadge order={order} />
        </div>
        <p className="text-muted-foreground text-sm">
          Placed {formatOrderDate(order.processedAt)}
          {order.financialStatus &&
            ` · Payment ${humanizeStatus(order.financialStatus).toLowerCase()}`}
        </p>
        {order.cancelledAt && (
          <p className="text-destructive text-sm">
            Cancelled {formatOrderDate(order.cancelledAt)}
            {order.cancelReason &&
              ` (${humanizeStatus(order.cancelReason).toLowerCase()})`}
          </p>
        )}
      </div>

      <section aria-labelledby="items-heading" className="grid gap-4">
        <h3 className="font-medium" id="items-heading">
          Items
        </h3>
        <ul className="grid gap-4">
          {order.lineItems.nodes.map((item) => (
            <li className="flex items-center gap-4" key={item.id}>
              {item.image ? (
                <ShopifyImage
                  alt={item.image.altText ?? item.name}
                  className="size-16 rounded-md bg-muted object-cover"
                  height={64}
                  src={item.image.url}
                  width={64}
                />
              ) : (
                <div className="size-16 rounded-md bg-muted" />
              )}
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-medium">{item.name}</p>
                {item.variantTitle && (
                  <p className="text-muted-foreground">{item.variantTitle}</p>
                )}
                <p className="text-muted-foreground">Qty {item.quantity}</p>
              </div>
              {item.totalPrice && (
                <span className="text-sm tabular-nums">
                  {formatMoney(item.totalPrice)}
                </span>
              )}
            </li>
          ))}
        </ul>
        <Separator />
        <dl className="ml-auto grid w-full max-w-xs gap-1 text-sm">
          <TotalRow label="Subtotal" money={order.subtotal} />
          <TotalRow label="Shipping" money={order.totalShipping} />
          <TotalRow label="Tax" money={order.totalTax} />
          <TotalRow label="Total" money={order.totalPrice} strong />
        </dl>
      </section>

      <section aria-labelledby="delivery-heading" className="grid gap-4">
        <h3 className="font-medium" id="delivery-heading">
          Delivery
        </h3>
        {fulfillments.length > 0 ? (
          <ul className="grid gap-3">
            {fulfillments.map((fulfillment, index) => (
              <FulfillmentCard
                fulfillment={fulfillment}
                index={index}
                key={fulfillment.id}
              />
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">
            {order.cancelledAt
              ? "This order was cancelled before it shipped."
              : "Nothing has shipped yet."}
          </p>
        )}
        {order.shippingAddress && (
          <address className="text-sm not-italic leading-relaxed">
            <span className="block font-medium">Shipping to</span>
            {order.shippingAddress.formatted.map((line) => (
              <span className="block text-muted-foreground" key={line}>
                {line}
              </span>
            ))}
          </address>
        )}
        <a
          className="text-sm underline underline-offset-4"
          href={order.statusPageUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          View order status page
        </a>
      </section>
    </article>
  );
}
