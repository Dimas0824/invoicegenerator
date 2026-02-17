import type { ReceiptStatus } from "./types";

export const RECEIPT_STATUS_OPTIONS: ReceiptStatus[] = [
  "Termin Pertama",
  "Termin Kedua",
  "Full",
];

export const DEFAULT_RECEIPT_STATUS: ReceiptStatus = "Termin Pertama";

export const RECEIPT_PAGE_LAYOUT = {
  widthMm: 210,
  heightMm: 297,
  horizontalPaddingMm: 12,
  verticalPaddingMm: 10,
  jsPdfFormat: "a4" as const,
};
