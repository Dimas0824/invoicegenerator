import type { BankName, PaymentMethod } from "../invoice/types";

export interface ReceiptDraftData {
  receiptNumber: string;
  receiptDate: string;
  receivedFrom: string;
  paymentFor: string;
  location: string;
  receivedBy: string;
}

export interface ReceiptData extends ReceiptDraftData {
  currency: string;
  amountReceived: number;
  amountInWords: string;
  terminNumber: number;
  terminPercent: number;
  terminLabel: string;
}

export interface ReceiptPaymentInfo {
  orderId: string;
  paymentMethod: PaymentMethod;
  bankName: BankName;
  accountNumber: string;
  recipientName: string;
}
