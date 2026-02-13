import type { InvoiceData } from "./types";

export const INITIAL_INVOICE_STATE: InvoiceData = {
  orderId: "WEB-DEV-1202",
  invoiceTagline: "JASA PENGEMBANGAN WEB",
  date: "2026-02-12",
  location: "Malang",
  sellerName: "Jasa Web Developer",
  signatureLabel: "Authorized Signature",
  sellerContact: "Admin Project",
  sellerPhone: "0812-3456-7890",
  buyerName: "Maowieee",
  paymentMethod: "Transfer",
  bankName: "BCA",
  showReceipt: false,
  receiptStatus: "Termin Pertama",
  accountNumber: "1234-567-890",
  recipientName: "AwiMawii",
  items: [
    {
      id: 1,
      title: "Jasa Pembuatan WebApp",
      details: "",
      quantity: 1,
      price: 305000,
    },
    {
      id: 2,
      title: "Server Hosting",
      details: "Hosting Cloud Indonesia - Cloud Medium",
      quantity: 1,
      price: 600000,
    },
    {
      id: 3,
      title: "Domain",
      details: ".id",
      quantity: 1,
      price: 279500,
    },
  ],
  dpType: "percent",
  dpValue: 30,
  currency: "IDR",
};

export const PAYMENT_METHOD_OPTIONS = ["Transfer", "E-Wallet", "QRIS"] as const;
export const BANK_OPTIONS = ["BCA", "BNI", "BRI", "Mandiri", "CIMB Niaga"] as const;
export const RECEIPT_STATUS_OPTIONS = [
  "Termin Pertama",
  "Termin Kedua",
  "Full",
] as const;
export const PAPER_SIZE_OPTIONS = ["A5", "A4", "A3", "Letter", "Legal"] as const;
export const PAGE_ORIENTATION_OPTIONS = ["portrait", "landscape"] as const;
