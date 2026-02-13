import type { DpType, InvoiceItem } from "./types";

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) {
    return "";
  }

  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  return new Date(dateString).toLocaleDateString("id-ID", options);
}

export function calculateSubtotal(items: InvoiceItem[]): number {
  return items.reduce((acc, item) => acc + item.quantity * item.price, 0);
}

export function calculateDP(
  subtotal: number,
  dpType: DpType,
  dpValue: number,
): number {
  if (dpType === "percent") {
    return subtotal * (dpValue / 100);
  }

  return dpValue;
}

export function calculateBalance(subtotal: number, dpAmount: number): number {
  return subtotal - dpAmount;
}
