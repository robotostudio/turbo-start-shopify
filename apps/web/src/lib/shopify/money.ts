import type { MoneyV2 } from "./types";

/** Formats MoneyV2 to locale-aware currency string. */
export function formatMoney(money: MoneyV2, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currencyCode,
  }).format(Number.parseFloat(money.amount));
}
