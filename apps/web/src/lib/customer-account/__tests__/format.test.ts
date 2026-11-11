import { describe, expect, it } from "vitest";

import {
  customerName,
  formatOrderDate,
  humanizeStatus,
  orderIdToParam,
  orderParamToId,
  orderStatus,
} from "../format";

describe("order ids", () => {
  it("strips and restores the gid prefix", () => {
    expect(orderIdToParam("gid://shopify/Order/123")).toBe("123");
    expect(orderParamToId("123")).toBe("gid://shopify/Order/123");
  });

  it("rejects non-numeric params", () => {
    expect(orderParamToId("abc")).toBeNull();
    expect(orderParamToId("1/../2")).toBeNull();
  });
});

describe("humanizeStatus", () => {
  it("turns enum values into sentence case", () => {
    expect(humanizeStatus("PARTIALLY_FULFILLED")).toBe("Partially fulfilled");
    expect(humanizeStatus("IN_TRANSIT")).toBe("In transit");
    expect(humanizeStatus(null)).toBe("");
  });
});

describe("orderStatus", () => {
  it("prefers cancellation over fulfilment", () => {
    expect(
      orderStatus({ cancelledAt: "2026-01-01", fulfillmentStatus: "FULFILLED" })
    ).toEqual({ label: "Cancelled", tone: "negative" });
  });

  it.each([
    ["FULFILLED", "positive"],
    ["PARTIALLY_FULFILLED", "progress"],
    ["UNFULFILLED", "neutral"],
  ])("maps %s to a %s tone", (status, tone) => {
    expect(
      orderStatus({ cancelledAt: null, fulfillmentStatus: status }).tone
    ).toBe(tone);
  });
});

describe("formatOrderDate", () => {
  it("formats in UTC so the day never shifts", () => {
    expect(formatOrderDate("2026-03-09T23:30:00Z")).toBe("9 March 2026");
  });
});

describe("customerName", () => {
  it("joins the parts that exist", () => {
    expect(customerName({ firstName: "Ada", lastName: "Lovelace" })).toBe(
      "Ada Lovelace"
    );
    expect(customerName({ firstName: null, lastName: "Lovelace" })).toBe(
      "Lovelace"
    );
    expect(customerName({ firstName: null, lastName: null })).toBe("");
  });
});
