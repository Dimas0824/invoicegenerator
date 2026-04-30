export type PaymentMethod = "Transfer" | "E-Wallet" | "QRIS";
export type BankName = "BCA" | "BNI" | "BRI" | "Mandiri" | "CIMB Niaga";
export type PaperSize = "A5" | "A4" | "A3" | "Letter" | "Legal";
export type PageOrientation = "portrait" | "landscape";

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
  accountNumber: string;
  recipientName: string;
  items: InvoiceItem[];
  dpPercent: number;
  terminNumber: number;
  terminPercent: number;
  currency: string;
}

export type InvoiceItemChangeHandler = <K extends keyof InvoiceItem>(
  id: number,
  field: K,
  value: InvoiceItem[K],
) => void;
