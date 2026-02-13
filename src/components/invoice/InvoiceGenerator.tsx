"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

import { INITIAL_INVOICE_STATE } from "./constants";
import InfoSection from "./InfoSection";
import InvoiceFooter from "./InvoiceFooter";
import InvoiceHeader from "./InvoiceHeader";
import ItemsTable from "./ItemsTable";
import ReceiptSection from "./ReceiptSection";
import Toolbar from "./Toolbar";
import TotalsSection from "./TotalsSection";
import type { InvoiceData, InvoiceItemChangeHandler } from "./types";
import {
  calculateBalance,
  calculateDP,
  calculateSubtotal,
  formatCurrency,
  formatDate,
} from "./utils";

const PDF_SAFE_STYLE_PROPS = [
  "color",
  "background-color",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "outline-color",
  "text-decoration-color",
  "column-rule-color",
  "caret-color",
  "fill",
  "stroke",
  "box-shadow",
  "text-shadow",
] as const;

type CssVarStyle = CSSProperties & Record<`--${string}`, string>;

const PDF_SAFE_TAILWIND_COLOR_VARS: CssVarStyle = {
  "--color-white": "#ffffff",
  "--color-gray-50": "#f9fafb",
  "--color-gray-100": "#f3f4f6",
  "--color-gray-200": "#e5e7eb",
  "--color-gray-300": "#d1d5db",
  "--color-gray-500": "#6b7280",
  "--color-gray-600": "#4b5563",
  "--color-gray-700": "#374151",
  "--color-gray-800": "#1f2937",
  "--color-gray-900": "#111827",
  "--color-blue-50": "#eff6ff",
  "--color-blue-100": "#dbeafe",
  "--color-blue-200": "#bfdbfe",
  "--color-blue-500": "#3b82f6",
  "--color-blue-600": "#2563eb",
  "--color-blue-700": "#1d4ed8",
  "--color-red-50": "#fef2f2",
  "--color-red-400": "#f87171",
  "--color-red-600": "#dc2626",
  "--color-red-700": "#b91c1c",
  "--color-slate-800": "#1e293b",
  "--color-slate-900": "#0f172a",
};

function syncComputedStylesForPdf(
  sourceRoot: HTMLElement,
  cloneRoot: HTMLElement,
): void {
  const sourceNodes = [
    sourceRoot,
    ...Array.from(sourceRoot.querySelectorAll<HTMLElement>("*")),
  ];
  const cloneNodes = [
    cloneRoot,
    ...Array.from(cloneRoot.querySelectorAll<HTMLElement>("*")),
  ];
  const nodeCount = Math.min(sourceNodes.length, cloneNodes.length);

  for (let index = 0; index < nodeCount; index += 1) {
    const sourceStyle = window.getComputedStyle(sourceNodes[index]);
    const targetStyle = cloneNodes[index].style;

    for (const styleProp of PDF_SAFE_STYLE_PROPS) {
      const computedValue = sourceStyle.getPropertyValue(styleProp);
      if (computedValue) {
        targetStyle.setProperty(styleProp, computedValue);
      }
    }
  }
}

export default function InvoiceGenerator() {
  const [invoice, setInvoice] = useState<InvoiceData>(INITIAL_INVOICE_STATE);
  const [isEditing, setIsEditing] = useState(true);
  const [isPdfReady, setIsPdfReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.html2pdf) {
      setIsPdfReady(true);
      return;
    }

    const existingScript = document.getElementById(
      "html2pdf-script",
    ) as HTMLScriptElement | null;

    if (existingScript) {
      const markReady = () => setIsPdfReady(true);
      existingScript.addEventListener("load", markReady);

      return () => {
        existingScript.removeEventListener("load", markReady);
      };
    }

    const script = document.createElement("script");
    script.id = "html2pdf-script";
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.async = true;

    const markReady = () => setIsPdfReady(true);
    const markError = () => {
      console.error("Gagal memuat library PDF");
      setIsPdfReady(false);
    };

    script.addEventListener("load", markReady);
    script.addEventListener("error", markError);
    document.body.appendChild(script);

    return () => {
      script.removeEventListener("load", markReady);
      script.removeEventListener("error", markError);
    };
  }, []);

  const subtotal = useMemo(() => calculateSubtotal(invoice.items), [invoice.items]);
  const dpAmount = useMemo(
    () => calculateDP(subtotal, invoice.dpType, invoice.dpValue),
    [subtotal, invoice.dpType, invoice.dpValue],
  );
  const balance = useMemo(() => calculateBalance(subtotal, dpAmount), [subtotal, dpAmount]);

  const formatCurrencyValue = (amount: number): string => {
    return formatCurrency(amount, invoice.currency);
  };

  const updateField = <K extends keyof InvoiceData>(
    field: K,
    value: InvoiceData[K],
  ): void => {
    setInvoice((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleItemChange: InvoiceItemChangeHandler = (id, field, value) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    }));
  };

  const addItem = () => {
    setInvoice((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now(),
          title: "Item Baru",
          details: "",
          quantity: 1,
          price: 0,
        },
      ],
    }));
  };

  const removeItem = (id: number) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const setDpTo30Percent = () => {
    setInvoice((prev) => ({
      ...prev,
      dpType: "percent",
      dpValue: 30,
    }));
  };

  const handleDownloadPDF = () => {
    const createPdf = window.html2pdf;
    if (!createPdf || !isPdfReady) {
      window.alert("Library PDF belum siap. Silakan gunakan tombol Manual Print.");
      return;
    }

    const element = contentRef.current;
    if (!element) {
      window.alert("Konten invoice tidak ditemukan.");
      return;
    }

    setIsGenerating(true);
    const wasEditing = isEditing;
    setIsEditing(false);

    window.setTimeout(() => {
      const options = {
        margin: 0,
        filename: `Invoice-${invoice.orderId}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          scrollY: 0,
          scrollX: 0,
          onclone: (clonedDocument: Document) => {
            const cloneElement = clonedDocument.getElementById("invoice-content");
            if (!(cloneElement instanceof HTMLElement)) {
              return;
            }

            syncComputedStylesForPdf(element, cloneElement);
          },
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      createPdf()
        .set(options)
        .from(element)
        .save()
        .then(() => {
          setIsEditing(wasEditing);
          setIsGenerating(false);
        })
        .catch((error: unknown) => {
          console.error("PDF Error:", error);
          window.alert("Gagal download otomatis. Gunakan tombol Manual.");
          setIsEditing(wasEditing);
          setIsGenerating(false);
        });
    }, 800);
  };

  const handleManualPrint = () => {
    const wasEditing = isEditing;
    setIsEditing(false);

    window.setTimeout(() => {
      window.print();
      setIsEditing(wasEditing);
    }, 500);
  };

  return (
    <div
      className="min-h-screen bg-gray-200 font-sans p-3 flex flex-col items-center"
      style={PDF_SAFE_TAILWIND_COLOR_VARS}
    >
      <Toolbar
        isEditing={isEditing}
        isGenerating={isGenerating}
        showReceipt={invoice.showReceipt}
        receiptStatus={invoice.receiptStatus}
        onResetDp={setDpTo30Percent}
        onToggleEdit={() => setIsEditing((prev) => !prev)}
        onToggleReceipt={() => updateField("showReceipt", !invoice.showReceipt)}
        onReceiptStatusChange={(value) => updateField("receiptStatus", value)}
        onManualPrint={handleManualPrint}
        onDownloadPdf={handleDownloadPDF}
      />

      <div
        className={`overflow-auto w-full flex pb-10 print:pb-0 transition-all duration-200 ${
          isGenerating ? "justify-start pl-0" : "justify-center"
        }`}
      >
        <div
          ref={contentRef}
          id="invoice-content"
          className="bg-white shadow-2xl print:shadow-none relative box-border text-slate-900 leading-tight"
          style={{
            width: "210mm",
            minHeight: "297mm",
            padding: "10mm 12mm",
            flexShrink: 0,
          }}
        >
          <InvoiceHeader
            orderId={invoice.orderId}
            tagline={invoice.invoiceTagline}
            isEditing={isEditing}
            onOrderIdChange={(value) => updateField("orderId", value)}
            onTaglineChange={(value) => updateField("invoiceTagline", value)}
          />

          <InfoSection
            buyerName={invoice.buyerName}
            date={invoice.date}
            paymentMethod={invoice.paymentMethod}
            bankName={invoice.bankName}
            accountNumber={invoice.accountNumber}
            recipientName={invoice.recipientName}
            isEditing={isEditing}
            formatDate={formatDate}
            onBuyerNameChange={(value) => updateField("buyerName", value)}
            onDateChange={(value) => updateField("date", value)}
            onPaymentMethodChange={(value) => updateField("paymentMethod", value)}
            onBankNameChange={(value) => updateField("bankName", value)}
            onAccountNumberChange={(value) => updateField("accountNumber", value)}
            onRecipientNameChange={(value) => updateField("recipientName", value)}
          />

          <ItemsTable
            items={invoice.items}
            isEditing={isEditing}
            formatCurrency={formatCurrencyValue}
            onItemChange={handleItemChange}
            onAddItem={addItem}
            onRemoveItem={removeItem}
          />

          <TotalsSection
            subtotal={subtotal}
            dpValue={invoice.dpValue}
            dpAmount={dpAmount}
            balance={balance}
            isEditing={isEditing}
            formatCurrency={formatCurrencyValue}
            onDpValueChange={(value) => updateField("dpValue", value)}
          />

          {invoice.showReceipt ? (
            <ReceiptSection
              receiptStatus={invoice.receiptStatus}
              subtotal={subtotal}
              dpAmount={dpAmount}
              balance={balance}
              formatCurrency={formatCurrencyValue}
            />
          ) : null}

          <InvoiceFooter
            location={invoice.location}
            date={invoice.date}
            sellerName={invoice.sellerName}
            signatureLabel={invoice.signatureLabel}
            isEditing={isEditing}
            formatDate={formatDate}
            onLocationChange={(value) => updateField("location", value)}
            onSignatureLabelChange={(value) => updateField("signatureLabel", value)}
          />
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }

          body {
            background: white;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:pb-0 { padding-bottom: 0 !important; }

          #invoice-content {
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 10mm 12mm !important;
            page-break-after: avoid;
          }
        }
      `}</style>
    </div>
  );
}
