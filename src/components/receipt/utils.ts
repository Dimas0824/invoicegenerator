import type { ReceiptData, ReceiptDraftData } from "./types";
import type { InvoiceData } from "../invoice/types";
import {
  calculateSubtotal,
  calculateTerminAmount,
  formatTerminLabel,
} from "../invoice/utils";

const INDONESIAN_NUMBER_WORDS = [
  "nol",
  "satu",
  "dua",
  "tiga",
  "empat",
  "lima",
  "enam",
  "tujuh",
  "delapan",
  "sembilan",
  "sepuluh",
  "sebelas",
];

function normalizeSpacing(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function numberToWords(value: number): string {
  if (value < 12) {
    return INDONESIAN_NUMBER_WORDS[value];
  }

  if (value < 20) {
    return `${numberToWords(value - 10)} belas`;
  }

  if (value < 100) {
    const tens = Math.floor(value / 10);
    const remainder = value % 10;
    const remainderText = remainder > 0 ? ` ${numberToWords(remainder)}` : "";
    return `${numberToWords(tens)} puluh${remainderText}`;
  }

  if (value < 200) {
    const remainder = value - 100;
    return remainder > 0 ? `seratus ${numberToWords(remainder)}` : "seratus";
  }

  if (value < 1000) {
    const hundreds = Math.floor(value / 100);
    const remainder = value % 100;
    const remainderText = remainder > 0 ? ` ${numberToWords(remainder)}` : "";
    return `${numberToWords(hundreds)} ratus${remainderText}`;
  }

  if (value < 2000) {
    const remainder = value - 1000;
    return remainder > 0 ? `seribu ${numberToWords(remainder)}` : "seribu";
  }

  if (value < 1_000_000) {
    const thousands = Math.floor(value / 1000);
    const remainder = value % 1000;
    const remainderText = remainder > 0 ? ` ${numberToWords(remainder)}` : "";
    return `${numberToWords(thousands)} ribu${remainderText}`;
  }

  if (value < 1_000_000_000) {
    const millions = Math.floor(value / 1_000_000);
    const remainder = value % 1_000_000;
    const remainderText = remainder > 0 ? ` ${numberToWords(remainder)}` : "";
    return `${numberToWords(millions)} juta${remainderText}`;
  }

  if (value < 1_000_000_000_000) {
    const billions = Math.floor(value / 1_000_000_000);
    const remainder = value % 1_000_000_000;
    const remainderText = remainder > 0 ? ` ${numberToWords(remainder)}` : "";
    return `${numberToWords(billions)} miliar${remainderText}`;
  }

  const trillions = Math.floor(value / 1_000_000_000_000);
  const remainder = value % 1_000_000_000_000;
  const remainderText = remainder > 0 ? ` ${numberToWords(remainder)}` : "";
  return `${numberToWords(trillions)} triliun${remainderText}`;
}

export function toAmountInWords(amount: number): string {
  const rounded = Math.floor(Math.abs(amount));
  const prefix = amount < 0 ? "minus " : "";
  const words = rounded === 0 ? "nol" : normalizeSpacing(numberToWords(rounded));
  return `${prefix}${words} rupiah`;
}

export function toCompactDate(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "00000000";
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}${month}${day}`;
}

export function formatEmptyValue(value: string): string {
  const normalized = normalizeSpacing(value);
  return normalized.length > 0 ? normalized : "-";
}

export function createReceiptDraftFromInvoice(invoice: InvoiceData): ReceiptDraftData {
  const receiptDate = invoice.date || new Date().toISOString().slice(0, 10);
  const orderId = invoice.orderId.trim().length > 0 ? invoice.orderId.trim() : "INV";
  const terminLabel = formatTerminLabel(invoice.terminNumber);

  return {
    receiptNumber: `KW-${orderId}-${toCompactDate(receiptDate)}`,
    receiptDate,
    receivedFrom: invoice.buyerName,
    paymentFor: invoice.invoiceTagline
      ? `Pembayaran ${terminLabel} ${invoice.invoiceTagline}`
      : `Pembayaran ${terminLabel}`,
    location: invoice.location,
    receivedBy:
      invoice.invoiceTagline.trim().length > 0
        ? invoice.invoiceTagline
        : invoice.sellerName,
  };
}

export function buildReceiptData(
  invoice: InvoiceData,
  draft: ReceiptDraftData,
): ReceiptData {
  const subtotal = calculateSubtotal(invoice.items);
  const amountReceived = calculateTerminAmount(subtotal, invoice.terminPercent);
  const terminLabel = formatTerminLabel(invoice.terminNumber);

  return {
    ...draft,
    currency: invoice.currency,
    amountReceived,
    amountInWords: toAmountInWords(amountReceived),
    terminNumber: invoice.terminNumber,
    terminPercent: invoice.terminPercent,
    terminLabel,
  };
}
