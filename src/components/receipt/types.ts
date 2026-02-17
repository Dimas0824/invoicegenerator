import type { BankName, PaymentMethod } from "../invoice/types";

export type ReceiptStatus = "Termin Pertama" | "Termin Kedua" | "Full";

export interface ReceiptDraftData {
  receiptNumber: string;
  receiptDate: string;
  receiptStatus: ReceiptStatus;
  receivedFrom: string;
  paymentFor: string;
  location: string;
  receivedBy: string;
}

export interface ReceiptData extends ReceiptDraftData {
  currency: string;
  amountReceived: number;
  amountInWords: string;
}

export interface ReceiptPaymentInfo {
  orderId: string;
  paymentMethod: PaymentMethod;
  bankName: BankName;
  accountNumber: string;
  recipientName: string;
}
