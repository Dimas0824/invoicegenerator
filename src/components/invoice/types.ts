export type PaymentMethod = "Transfer" | "E-Wallet" | "QRIS";

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
  date: string;
  location: string;
  sellerName: string;
  sellerContact: string;
  sellerPhone: string;
  buyerName: string;
  paymentMethod: PaymentMethod;
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
