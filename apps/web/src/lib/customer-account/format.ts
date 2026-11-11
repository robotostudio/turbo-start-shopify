/** Pure presentation helpers for customer account data. */

const ORDER_GID_PREFIX = "gid://shopify/Order/";

/** `gid://shopify/Order/123` → `123`, for a readable `/account/orders/123`. */
export function orderIdToParam(gid: string): string {
  return gid.startsWith(ORDER_GID_PREFIX)
    ? gid.slice(ORDER_GID_PREFIX.length)
    : gid;
}

/** The reverse of `orderIdToParam`; `null` for anything not a numeric id. */
export function orderParamToId(param: string): string | null {
  return /^\d+$/.test(param) ? `${ORDER_GID_PREFIX}${param}` : null;
}

/** `PARTIALLY_FULFILLED` → `Partially fulfilled`. */
export function humanizeStatus(status: string | null | undefined): string {
  if (!status) return "";
  const words = status.toLowerCase().replaceAll('_', ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export type StatusTone = "positive" | "progress" | "neutral" | "negative";

/** One badge per order: cancellation wins, then fulfilment. */
export function orderStatus(order: {
  cancelledAt: string | null;
  fulfillmentStatus: string;
}): { label: string; tone: StatusTone } {
  if (order.cancelledAt) return { label: "Cancelled", tone: "negative" };
  switch (order.fulfillmentStatus) {
    case "FULFILLED":
      return { label: "Fulfilled", tone: "positive" };
    case "PARTIALLY_FULFILLED":
    case "IN_PROGRESS":
      return {
        label: humanizeStatus(order.fulfillmentStatus),
        tone: "progress",
      };
    default:
      return {
        label: humanizeStatus(order.fulfillmentStatus),
        tone: "neutral",
      };
  }
}

export function formatOrderDate(iso: string, locale = "en-GB"): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function customerName(customer: {
  firstName: string | null;
  lastName: string | null;
}): string {
  return [customer.firstName, customer.lastName].filter(Boolean).join(" ");
}
