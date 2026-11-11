import type { MoneyV2 } from "@/lib/shopify/types";

/** Hand-written to match `queries.ts`; Shopify enums are kept as strings. */

export type CustomerImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

export type CustomerAddress = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  zoneCode: string | null;
  territoryCode: string | null;
  zip: string | null;
  phoneNumber: string | null;
  formatted: string[];
};

export type OrderSummary = {
  id: string;
  name: string;
  processedAt: string;
  cancelledAt: string | null;
  financialStatus: string | null;
  fulfillmentStatus: string;
  totalPrice: MoneyV2;
  lineItems: {
    nodes: Array<{ id: string; name: string; image: CustomerImage | null }>;
  };
};

export type CustomerOverview = {
  customer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    displayName: string;
    emailAddress: { emailAddress: string | null } | null;
    defaultAddress: CustomerAddress | null;
    orders: { nodes: OrderSummary[] };
  };
};

export type CustomerOrders = {
  customer: {
    orders: {
      nodes: OrderSummary[];
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    };
  };
};

export type OrderLineItem = {
  id: string;
  name: string;
  variantTitle: string | null;
  quantity: number;
  sku: string | null;
  image: CustomerImage | null;
  price: MoneyV2 | null;
  totalPrice: MoneyV2 | null;
};

export type OrderFulfillment = {
  id: string;
  createdAt: string;
  status: string | null;
  latestShipmentStatus: string | null;
  trackingInformation: Array<{
    company: string | null;
    number: string | null;
    url: string | null;
  }>;
  fulfillmentLineItems: {
    nodes: Array<{
      id: string;
      quantity: number;
      lineItem: { id: string; name: string };
    }>;
  };
};

export type CustomerOrder = {
  order: {
    id: string;
    name: string;
    processedAt: string;
    cancelledAt: string | null;
    cancelReason: string | null;
    financialStatus: string | null;
    fulfillmentStatus: string;
    statusPageUrl: string;
    subtotal: MoneyV2 | null;
    totalShipping: MoneyV2;
    totalTax: MoneyV2 | null;
    totalPrice: MoneyV2;
    shippingAddress: { name: string | null; formatted: string[] } | null;
    lineItems: { nodes: OrderLineItem[] };
    fulfillments: { nodes: OrderFulfillment[] };
  } | null;
};

export type CustomerProfile = {
  customer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    emailAddress: { emailAddress: string | null } | null;
    defaultAddress: { id: string } | null;
    addresses: { nodes: CustomerAddress[] };
  };
};

export type CustomerUserError = {
  field: string[] | null;
  message: string;
  code: string | null;
};
