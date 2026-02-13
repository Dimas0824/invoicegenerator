export type PaymentMethod = "Transfer" | "E-Wallet" | "QRIS";
export type BankName = "BCA" | "BNI" | "BRI" | "Mandiri" | "CIMB Niaga";
export type ReceiptStatus = "Termin Pertama" | "Termin Kedua" | "Full";

export type DpType = "percent" | "fixed";

export interface InvoiceItem {
  id: number;
  title: string;
  details: string;
  quantity: number;
  price: number;
}

export interface InvoiceData {
  orderId: string;
  invoiceTagline: string;
  date: string;
  location: string;
  sellerName: string;
  signatureLabel: string;
  sellerContact: string;
  sellerPhone: string;
  buyerName: string;
  paymentMethod: PaymentMethod;
  bankName: BankName;
  showReceipt: boolean;
  receiptStatus: ReceiptStatus;
  accountNumber: string;
  recipientName: string;
  items: InvoiceItem[];
  dpType: DpType;
  dpValue: number;
  currency: string;
}

export type InvoiceItemChangeHandler = <K extends keyof InvoiceItem>(
  id: number,
  field: K,
  value: InvoiceItem[K],
) => void;
