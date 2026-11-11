/**
 * Customer account seed — creates a test customer with addresses and orders
 * in every fulfilment state, so `/account` has something to show.
 *
 * Usage:
 *   pnpm seed:customers -- --email=you+shop@example.com   # create
 *   pnpm seed:customers -- --email=you+shop@example.com --clean
 *
 * Sign-in is passwordless: Shopify emails a one-time code to the customer's
 * address, so `--email` must be an inbox you can read. Plus-addressing
 * (`you+shop@gmail.com`) keeps it separate from any real customer record.
 *
 * Needs the products from `pnpm seed:shopify` (any active variants will do),
 * and an Admin token with: read_products, read_customers, write_customers,
 * read_orders, write_orders, write_merchant_managed_fulfillment_orders,
 * write_fulfillments.
 */

import {
  adminQuery,
  getStoreDomain,
  hasUserErrors,
  log,
} from "../seed-shopify/client.js";
import type { UserError } from "../seed-shopify/types.js";

const SEED_TAG = "seed-customers";
const DAY_MS = 24 * 60 * 60 * 1000;

type Flags = { email: string; clean: boolean };

function parseFlags(): Flags {
  let email = process.env.SEED_CUSTOMER_EMAIL ?? "";
  let clean = false;
  for (const arg of process.argv.slice(2)) {
    if (arg === "--clean") clean = true;
    else if (arg.startsWith("--email=")) email = arg.slice("--email=".length);
  }
  if (!email.includes("@")) {
    log.error(
      "Pass --email=<an inbox you can read> (or set SEED_CUSTOMER_EMAIL). Shopify emails the sign-in code there."
    );
    process.exit(1);
  }
  return { email: email.trim().toLowerCase(), clean };
}

const HOME = {
  firstName: "Ada",
  lastName: "Lovelace",
  address1: "12 St James's Square",
  city: "London",
  zip: "SW1Y 4JH",
  countryCode: "GB",
  phone: "+442079460000",
};

const WORK = {
  firstName: "Ada",
  lastName: "Lovelace",
  company: "Analytical Engines Ltd",
  address1: "1 Brewery Square",
  city: "Dorchester",
  zip: "DT1 1GA",
  countryCode: "GB",
};

type Scenario = {
  label: string;
  daysAgo: number;
  lines: number;
  /** How many of the order's lines get a fulfilment. */
  fulfil: "none" | "first" | "all";
  shipmentStatus?: "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED";
  cancel?: boolean;
};

const SCENARIOS: Scenario[] = [
  {
    label: "delivered",
    daysAgo: 60,
    lines: 2,
    fulfil: "all",
    shipmentStatus: "DELIVERED",
  },
  {
    label: "in transit",
    daysAgo: 6,
    lines: 1,
    fulfil: "all",
    shipmentStatus: "IN_TRANSIT",
  },
  { label: "partially fulfilled", daysAgo: 3, lines: 3, fulfil: "first" },
  { label: "unfulfilled", daysAgo: 1, lines: 2, fulfil: "none" },
  { label: "cancelled", daysAgo: 20, lines: 1, fulfil: "none", cancel: true },
];

const FIND_CUSTOMER = /* graphql */ `
  query FindCustomer($query: String!) {
    customers(first: 1, query: $query) { nodes { id tags } }
  }
`;

const CREATE_CUSTOMER = /* graphql */ `
  mutation CreateCustomer($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer { id }
      userErrors { field message }
    }
  }
`;

const SEED_VARIANTS = /* graphql */ `
  query SeedVariants($first: Int!) {
    productVariants(first: $first, query: "status:active") {
      nodes { id title product { title } }
    }
  }
`;

const CREATE_ORDER = /* graphql */ `
  mutation CreateOrder(
    $order: OrderCreateOrderInput!
    $options: OrderCreateOptionsInput
  ) {
    orderCreate(order: $order, options: $options) {
      order { id name }
      userErrors { field message }
    }
  }
`;

const ORDER_FULFILLMENT_ORDERS = /* graphql */ `
  query OrderFulfillmentOrders($id: ID!) {
    order(id: $id) {
      fulfillmentOrders(first: 5) {
        nodes {
          id
          status
          lineItems(first: 50) { nodes { id remainingQuantity } }
        }
      }
    }
  }
`;

const CREATE_FULFILLMENT = /* graphql */ `
  mutation Fulfil($fulfillment: FulfillmentInput!) {
    fulfillmentCreate(fulfillment: $fulfillment) {
      fulfillment { id status }
      userErrors { field message }
    }
  }
`;

const CREATE_FULFILLMENT_EVENT = /* graphql */ `
  mutation FulfilmentEvent($fulfillmentEvent: FulfillmentEventInput!) {
    fulfillmentEventCreate(fulfillmentEvent: $fulfillmentEvent) {
      fulfillmentEvent { id status }
      userErrors { field message }
    }
  }
`;

const CANCEL_ORDER = /* graphql */ `
  mutation CancelOrder($orderId: ID!) {
    orderCancel(
      orderId: $orderId
      reason: CUSTOMER
      restock: true
      notifyCustomer: false
    ) {
      job { id }
      orderCancelUserErrors { field message code }
    }
  }
`;

const SEEDED_ORDERS = /* graphql */ `
  query SeededOrders($query: String!) {
    orders(first: 50, query: $query) { nodes { id name } }
  }
`;

const DELETE_ORDER = /* graphql */ `
  mutation DeleteOrder($orderId: ID!) {
    orderDelete(orderId: $orderId) {
      deletedId
      userErrors { field message }
    }
  }
`;

const DELETE_CUSTOMER = /* graphql */ `
  mutation DeleteCustomer($input: CustomerDeleteInput!) {
    customerDelete(input: $input) {
      deletedCustomerId
      userErrors { field message }
    }
  }
`;

type Variant = { id: string; title: string; product: { title: string } };

function fail(message: string): never {
  log.error(message);
  process.exit(1);
}

type FoundCustomer = { id: string; tags: string[] };

async function findCustomer(email: string): Promise<FoundCustomer | null> {
  const result = await adminQuery<{ customers: { nodes: FoundCustomer[] } }>(
    FIND_CUSTOMER,
    { query: `email:${email}` }
  );
  return result.data?.customers.nodes[0] ?? null;
}

async function ensureCustomer(email: string): Promise<string> {
  const existing = await findCustomer(email);
  if (existing) {
    // Reused as-is, without the seed tag, so `--clean` leaves it in place.
    log.info(`Customer ${email} already exists (${existing.id}) — reusing`);
    return existing.id;
  }
  const result = await adminQuery<{
    customerCreate: { customer: { id: string } | null; userErrors: UserError[] };
  }>(CREATE_CUSTOMER, {
    input: {
      email,
      firstName: HOME.firstName,
      lastName: HOME.lastName,
      tags: [SEED_TAG],
      // The first address becomes the default.
      addresses: [HOME, WORK],
    },
  });
  if (result.errors?.length) fail(result.errors[0]?.message ?? "GraphQL error");
  const payload = result.data?.customerCreate;
  if (hasUserErrors(payload?.userErrors, "customerCreate") || !payload?.customer) {
    fail("Could not create the customer.");
  }
  log.info(`Created customer ${email}`);
  return payload.customer.id;
}

async function loadVariants(): Promise<Variant[]> {
  const result = await adminQuery<{ productVariants: { nodes: Variant[] } }>(
    SEED_VARIANTS,
    { first: 20 }
  );
  const variants = result.data?.productVariants.nodes ?? [];
  if (variants.length === 0) {
    fail("No active product variants. Run `pnpm seed:shopify` first.");
  }
  return variants;
}

function pickVariants(variants: Variant[], count: number, offset: number) {
  return Array.from({ length: count }, (_, index) => {
    const variant = variants[(offset + index) % variants.length];
    if (!variant) fail("Variant list unexpectedly empty.");
    return variant;
  });
}

async function createOrder(
  customerId: string,
  email: string,
  scenario: Scenario,
  variants: Variant[]
): Promise<{ id: string; name: string } | null> {
  const result = await adminQuery<{
    orderCreate: {
      order: { id: string; name: string } | null;
      userErrors: UserError[];
    };
  }>(CREATE_ORDER, {
    order: {
      email,
      customer: { toAssociate: { id: customerId } },
      lineItems: variants.map((variant, index) => ({
        variantId: variant.id,
        quantity: index === 0 ? 1 : 2,
      })),
      // A cancelled order is created unpaid so cancelling needs no refund.
      financialStatus: scenario.cancel ? "PENDING" : "PAID",
      processedAt: new Date(Date.now() - scenario.daysAgo * DAY_MS).toISOString(),
      shippingAddress: HOME,
      billingAddress: HOME,
      tags: [SEED_TAG],
    },
    options: { sendReceipt: false, sendFulfillmentReceipt: false },
  });
  if (result.errors?.length) {
    log.error(`orderCreate: ${result.errors[0]?.message}`);
    return null;
  }
  const payload = result.data?.orderCreate;
  if (hasUserErrors(payload?.userErrors, "orderCreate") || !payload?.order) {
    return null;
  }
  return payload.order;
}

type FulfillmentOrder = {
  id: string;
  status: string;
  lineItems: { nodes: { id: string; remainingQuantity: number }[] };
};

const POLL_ATTEMPTS = 10;
const POLL_INTERVAL_MS = 1000;

/**
 * Fulfilment orders are created asynchronously after the order, so poll.
 * Each attempt has to wait for the one before it, hence recursion rather than
 * an `await` inside a loop.
 */
async function waitForFulfillmentOrders(
  orderId: string,
  attemptsLeft = POLL_ATTEMPTS
): Promise<FulfillmentOrder[]> {
  const result = await adminQuery<{
    order: { fulfillmentOrders: { nodes: FulfillmentOrder[] } } | null;
  }>(ORDER_FULFILLMENT_ORDERS, { id: orderId });
  const nodes = result.data?.order?.fulfillmentOrders.nodes ?? [];
  if (nodes.length > 0 || attemptsLeft <= 1) return nodes;
  await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  return waitForFulfillmentOrders(orderId, attemptsLeft - 1);
}

async function fulfil(
  order: { id: string; name: string },
  scenario: Scenario
): Promise<void> {
  const fulfillmentOrders = await waitForFulfillmentOrders(order.id);
  const first = fulfillmentOrders[0];
  if (!first) {
    log.warn(`${order.name}: no fulfilment orders appeared — left unfulfilled`);
    return;
  }
  const lineItems = first.lineItems.nodes.filter(
    (line) => line.remainingQuantity > 0
  );
  const chosen = scenario.fulfil === "first" ? lineItems.slice(0, 1) : lineItems;
  const trackingNumber = `SEED${Date.now().toString().slice(-8)}`;

  const result = await adminQuery<{
    fulfillmentCreate: {
      fulfillment: { id: string } | null;
      userErrors: UserError[];
    };
  }>(CREATE_FULFILLMENT, {
    fulfillment: {
      notifyCustomer: false,
      trackingInfo: {
        company: "Royal Mail",
        number: trackingNumber,
        url: `https://www.royalmail.com/track-your-item#/tracking-results/${trackingNumber}`,
      },
      lineItemsByFulfillmentOrder: [
        {
          fulfillmentOrderId: first.id,
          fulfillmentOrderLineItems: chosen.map((line) => ({
            id: line.id,
            quantity: line.remainingQuantity,
          })),
        },
      ],
    },
  });
  const payload = result.data?.fulfillmentCreate;
  if (
    result.errors?.length ||
    hasUserErrors(payload?.userErrors, `${order.name} fulfillmentCreate`) ||
    !payload?.fulfillment
  ) {
    log.warn(`${order.name}: fulfilment failed — ${result.errors?.[0]?.message ?? "see above"}`);
    return;
  }

  if (scenario.shipmentStatus) {
    const event = await adminQuery<{
      fulfillmentEventCreate: { userErrors: UserError[] };
    }>(CREATE_FULFILLMENT_EVENT, {
      fulfillmentEvent: {
        fulfillmentId: payload.fulfillment.id,
        status: scenario.shipmentStatus,
      },
    });
    hasUserErrors(
      event.data?.fulfillmentEventCreate.userErrors,
      `${order.name} fulfillmentEventCreate`
    );
  }
}

async function cancel(order: { id: string; name: string }): Promise<void> {
  const result = await adminQuery<{
    orderCancel: { orderCancelUserErrors: UserError[] };
  }>(CANCEL_ORDER, { orderId: order.id });
  if (result.errors?.length) {
    log.warn(`${order.name}: cancel failed — ${result.errors[0]?.message}`);
    return;
  }
  hasUserErrors(
    result.data?.orderCancel.orderCancelUserErrors,
    `${order.name} orderCancel`
  );
}

async function seed(email: string): Promise<void> {
  const customerId = await ensureCustomer(email);
  const variants = await loadVariants();

  // Each scenario takes the next run of variants, so its offset is the sum of
  // the line counts before it. Worked out up front so the orders, which do
  // not depend on each other, can be created in parallel.
  const offsets = SCENARIOS.map((_, index) =>
    SCENARIOS.slice(0, index).reduce((sum, { lines }) => sum + lines, 0)
  );

  const orders = await Promise.all(
    SCENARIOS.map(async function seedScenario(scenario, index) {
      const picked = pickVariants(
        variants,
        scenario.lines,
        offsets[index] ?? 0
      );
      const order = await createOrder(customerId, email, scenario, picked);
      if (!order) return null;
      if (scenario.fulfil !== "none") await fulfil(order, scenario);
      if (scenario.cancel) await cancel(order);
      return order;
    })
  );

  // Logged afterwards, in scenario order, since the parallel calls finish in
  // any order.
  SCENARIOS.forEach((scenario, index) => {
    const order = orders[index];
    if (order) log.info(`${order.name} — ${scenario.label}`);
    else log.warn(`Skipped the ${scenario.label} order`);
  });
}

async function clean(email: string): Promise<void> {
  const orders = await adminQuery<{
    orders: { nodes: { id: string; name: string }[] };
  }>(SEEDED_ORDERS, {
    // Scoped to this email: another seeded customer's orders carry the same tag.
    query: `tag:${SEED_TAG} AND email:"${email}"`,
  });
  await Promise.all(
    (orders.data?.orders.nodes ?? []).map(async function deleteOrder(order) {
      const result = await adminQuery<{
        orderDelete: { userErrors: UserError[] };
      }>(DELETE_ORDER, { orderId: order.id });
      if (!hasUserErrors(result.data?.orderDelete.userErrors, order.name)) {
        log.info(`Deleted ${order.name}`);
      }
    })
  );

  const customer = await findCustomer(email);
  if (!customer) {
    log.info(`No customer ${email} to delete`);
    return;
  }
  // Only a customer this script created carries the tag; one that already
  // existed was reused, and its profile and addresses are not ours to delete.
  if (!customer.tags.includes(SEED_TAG)) {
    log.info(`Customer ${email} was not created by the seeder — keeping it`);
    return;
  }
  const result = await adminQuery<{
    customerDelete: { userErrors: UserError[] };
  }>(DELETE_CUSTOMER, { input: { id: customer.id } });
  if (!hasUserErrors(result.data?.customerDelete.userErrors, "customerDelete")) {
    log.info(`Deleted customer ${email}`);
  }
}

async function main(): Promise<void> {
  const { email, clean: shouldClean } = parseFlags();
  log.info(`Store: ${getStoreDomain()}`);
  if (shouldClean) {
    await clean(email);
    return;
  }
  await seed(email);
  log.info(
    `Done. Sign in at /account with ${email}; Shopify emails the code there.`
  );
}

main().catch((error: unknown) => {
  log.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
