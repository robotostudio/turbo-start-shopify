import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

import { OrderSummaryRow } from "@/components/account/order-summary-row";
import { loadCustomerData } from "@/lib/customer-account/load";
import { CUSTOMER_ORDERS_QUERY } from "@/lib/customer-account/queries";
import type { CustomerOrders } from "@/lib/customer-account/types";
import { getSEOMetadata } from "@/lib/seo";

const PAGE_SIZE = 10;

export async function generateMetadata() {
  return await getSEOMetadata({
    title: "Orders",
    description: "Your order history.",
    slug: "/account/orders",
    seoNoIndex: true,
  });
}

/**
 * Cursor pagination, forwards only: Shopify cursors are opaque, so "Newer
 * orders" goes back to the first page rather than tracking a cursor stack.
 */
export default async function AccountOrdersPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ after?: string }>;
}>) {
  const { after } = await searchParams;
  const returnTo = after
    ? `/account/orders?after=${encodeURIComponent(after)}`
    : "/account/orders";
  const { customer } = await loadCustomerData<CustomerOrders>(
    CUSTOMER_ORDERS_QUERY,
    returnTo,
    { first: PAGE_SIZE, after: after ?? null }
  );
  const { nodes, pageInfo } = customer.orders;

  return (
    <section aria-labelledby="orders-heading" className="grid gap-4">
      <h2 className="font-medium text-xl" id="orders-heading">
        Orders
      </h2>
      {nodes.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {after ? "No more orders." : "You haven't placed any orders yet."}
        </p>
      ) : (
        <ul className="grid gap-3">
          {nodes.map((order) => (
            <OrderSummaryRow key={order.id} order={order} />
          ))}
        </ul>
      )}
      <div className="flex gap-3">
        {after && (
          <Button asChild variant="outline">
            <Link href="/account/orders">Newest orders</Link>
          </Button>
        )}
        {pageInfo.hasNextPage && pageInfo.endCursor && (
          <Button asChild variant="outline">
            <Link
              href={`/account/orders?after=${encodeURIComponent(pageInfo.endCursor)}`}
            >
              Older orders
            </Link>
          </Button>
        )}
      </div>
    </section>
  );
}
