import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

import { OrderSummaryRow } from "@/components/account/order-summary-row";
import { customerName } from "@/lib/customer-account/format";
import { loadCustomerData } from "@/lib/customer-account/load";
import { CUSTOMER_OVERVIEW_QUERY } from "@/lib/customer-account/queries";
import type { CustomerOverview } from "@/lib/customer-account/types";
import { getSEOMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return await getSEOMetadata({
    title: "Account",
    description: "Your orders, profile and addresses.",
    slug: "/account",
    seoNoIndex: true,
  });
}

export default async function AccountOverviewPage() {
  const { customer } = await loadCustomerData<CustomerOverview>(
    CUSTOMER_OVERVIEW_QUERY,
    "/account"
  );
  const name = customerName(customer);
  const orders = customer.orders.nodes;

  return (
    <div className="grid gap-10">
      <section>
        <h2 className="font-medium text-xl">
          {name
            ? `Welcome back, ${customer.firstName ?? name}`
            : "Welcome back"}
        </h2>
        <p className="text-muted-foreground text-sm">
          {customer.emailAddress?.emailAddress}
        </p>
      </section>

      <section aria-labelledby="recent-orders" className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-lg" id="recent-orders">
            Recent orders
          </h2>
          {orders.length > 0 && (
            <Link
              className="text-sm underline-offset-4 hover:underline"
              href="/account/orders"
            >
              View all
            </Link>
          )}
        </div>
        {orders.length > 0 ? (
          <ul className="grid gap-3">
            {orders.map((order) => (
              <OrderSummaryRow key={order.id} order={order} />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-start gap-4 rounded-lg border p-6">
            <p className="text-muted-foreground text-sm">
              You haven't placed any orders yet.
            </p>
            <Button asChild>
              <Link href="/collections">Start shopping</Link>
            </Button>
          </div>
        )}
      </section>

      <section aria-labelledby="default-address" className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-lg" id="default-address">
            Default address
          </h2>
          <Link
            className="text-sm underline-offset-4 hover:underline"
            href="/account/profile"
          >
            Manage
          </Link>
        </div>
        {customer.defaultAddress ? (
          <address className="rounded-lg border p-4 text-sm not-italic leading-relaxed">
            {customer.defaultAddress.formatted.map((line) => (
              <span className="block" key={line}>
                {line}
              </span>
            ))}
          </address>
        ) : (
          <p className="text-muted-foreground text-sm">
            No default address saved.
          </p>
        )}
      </section>
    </div>
  );
}
