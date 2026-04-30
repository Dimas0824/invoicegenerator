import type { InvoiceItem } from "./types";

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

export function clampPercentage(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(value, 0), 100);
}

export function normalizeTerminNumber(value: number): number {
  if (!Number.isFinite(value)) {
    return 2;
  }

  return Math.max(2, Math.floor(value));
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(clampPercentage(value));
}

export function formatTerminLabel(terminNumber: number): string {
  return `Termin ke-${normalizeTerminNumber(terminNumber)}`;
}

export function calculateTerminAmount(
  subtotal: number,
  terminPercent: number,
): number {
  return subtotal * (clampPercentage(terminPercent) / 100);
}
