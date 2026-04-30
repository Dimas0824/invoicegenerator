"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";

import { INITIAL_INVOICE_STATE } from "./constants";
import { useInvoiceSession } from "../../context/InvoiceSessionContext";
import InfoSection from "./InfoSection";
import InvoiceFooter from "./InvoiceFooter";
import InvoiceHeader from "./InvoiceHeader";
import ItemsTable from "./ItemsTable";
import Toolbar from "./Toolbar";
import TotalsSection from "./TotalsSection";
import type {
  InvoiceData,
  InvoiceItemChangeHandler,
  PageOrientation,
  PaperSize,
} from "./types";
import {
  calculateSubtotal,
  calculateTerminAmount,
  clampPercentage,
  formatCurrency,
  formatDate,
  formatPercentage,
  normalizeTerminNumber,
} from "./utils";

const UNSUPPORTED_COLOR_FUNCTION_PATTERN =
  /\b(?:lab|lch|oklab|oklch|color)\(/i;
const OUTPUT_SAFE_SCALE_MARGIN = 0.97;

type LegacyInvoiceData = Partial<InvoiceData> & {
  dpValue?: number;
};

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

const PAGE_SIZE_DIMENSIONS: Record<
  PaperSize,
  {
    widthMm: number;
    heightMm: number;
    jsPdfFormat: "a5" | "a4" | "a3" | "letter" | "legal";
  }
> = {
  A5: { widthMm: 148, heightMm: 210, jsPdfFormat: "a5" },
  A4: { widthMm: 210, heightMm: 297, jsPdfFormat: "a4" },
  A3: { widthMm: 297, heightMm: 420, jsPdfFormat: "a3" },
  Letter: { widthMm: 216, heightMm: 279, jsPdfFormat: "letter" },
  Legal: { widthMm: 216, heightMm: 356, jsPdfFormat: "legal" },
};

function normalizeInvoiceData(draft: LegacyInvoiceData | null): InvoiceData {
  if (!draft) {
    return INITIAL_INVOICE_STATE;
  }

  const fallbackDpPercent =
    typeof draft.dpValue === "number" ? draft.dpValue : INITIAL_INVOICE_STATE.dpPercent;

  return {
    ...INITIAL_INVOICE_STATE,
    ...draft,
    dpPercent: clampPercentage(draft.dpPercent ?? fallbackDpPercent),
    terminNumber: normalizeTerminNumber(
      draft.terminNumber ?? INITIAL_INVOICE_STATE.terminNumber,
    ),
    terminPercent: clampPercentage(
      draft.terminPercent ?? INITIAL_INVOICE_STATE.terminPercent,
    ),
  };
}

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

    for (const styleProp of Array.from(sourceStyle)) {
      if (styleProp.startsWith("--")) {
        continue;
      }

      const computedValue = sourceStyle.getPropertyValue(styleProp);
      if (!computedValue || UNSUPPORTED_COLOR_FUNCTION_PATTERN.test(computedValue)) {
        continue;
      }

      const priority = sourceStyle.getPropertyPriority(styleProp);
      if (priority) {
        targetStyle.setProperty(styleProp, computedValue, priority);
      } else {
        targetStyle.setProperty(styleProp, computedValue);
      }
    }
  }
}

function stripStylesheetsInClone(clonedDocument: Document): void {
  const styleNodes = clonedDocument.querySelectorAll('style, link[rel="stylesheet"]');
  styleNodes.forEach((node) => node.remove());
}

function getAutoScaleForOutput(
  element: HTMLElement,
  pageWidthMm: number,
  pageHeightMm: number,
): number {
  const elementWidthPx = element.getBoundingClientRect().width;
  const pxPerMm = elementWidthPx / pageWidthMm;
  const pageHeightPx = pageHeightMm * pxPerMm;
  const heightScale = pageHeightPx / element.scrollHeight;
  const nextScale = Math.min(1, heightScale * OUTPUT_SAFE_SCALE_MARGIN);

  if (!Number.isFinite(nextScale) || nextScale <= 0) {
    return 1;
  }

  return nextScale;
}

function applyTemporaryScaleForOutput(
  element: HTMLElement,
  scale: number,
): () => void {
  if (scale >= 0.999) {
    return () => {};
  }

  const previousTransform = element.style.transform;
  const previousTransformOrigin = element.style.transformOrigin;
  const previousHeight = element.style.height;
  const previousMinHeight = element.style.minHeight;
  const previousOverflow = element.style.overflow;
  const previousMarginLeft = element.style.marginLeft;
  const previousMarginRight = element.style.marginRight;
  const scaledHeight = element.scrollHeight * scale;

  element.style.transformOrigin = "top center";
  element.style.transform = `scale(${scale})`;
  element.style.height = `${scaledHeight}px`;
  element.style.minHeight = `${scaledHeight}px`;
  element.style.overflow = "hidden";
  element.style.marginLeft = "auto";
  element.style.marginRight = "auto";

  return () => {
    element.style.transform = previousTransform;
    element.style.transformOrigin = previousTransformOrigin;
    element.style.height = previousHeight;
    element.style.minHeight = previousMinHeight;
    element.style.overflow = previousOverflow;
    element.style.marginLeft = previousMarginLeft;
    element.style.marginRight = previousMarginRight;
  };
}

export default function InvoiceGenerator() {
  const router = useRouter();
  const { invoiceDraft, setInvoiceDraft } = useInvoiceSession();
  const [invoice, setInvoice] = useState<InvoiceData>(
    () => normalizeInvoiceData(invoiceDraft),
  );
  const [isEditing, setIsEditing] = useState(true);
  const [isPdfReady, setIsPdfReady] = useState(
    () => typeof window !== "undefined" && Boolean(window.html2pdf),
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [paperSize, setPaperSize] = useState<PaperSize>("A4");
  const [pageOrientation, setPageOrientation] = useState<PageOrientation>("portrait");
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setInvoiceDraft(invoice);
  }, [invoice, setInvoiceDraft]);

  useEffect(() => {
    if (window.html2pdf) {
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
    () => calculateTerminAmount(subtotal, invoice.dpPercent),
    [subtotal, invoice.dpPercent],
  );
  const terminAmount = useMemo(
    () => calculateTerminAmount(subtotal, invoice.terminPercent),
    [subtotal, invoice.terminPercent],
  );

  const formatCurrencyValue = (amount: number): string => {
    return formatCurrency(amount, invoice.currency);
  };

  const pageLayout = useMemo(() => {
    const base = PAGE_SIZE_DIMENSIONS[paperSize];
    const isLandscape = pageOrientation === "landscape";
    const widthMm = isLandscape ? base.heightMm : base.widthMm;
    const heightMm = isLandscape ? base.widthMm : base.heightMm;
    const horizontalPaddingMm = paperSize === "A5" ? 8 : 12;
    const verticalPaddingMm = paperSize === "A5" ? 8 : 10;

    return {
      widthMm,
      heightMm,
      horizontalPaddingMm,
      verticalPaddingMm,
      jsPdfFormat: base.jsPdfFormat,
    };
  }, [paperSize, pageOrientation]);

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

  const setTerminToSecondBilling = () => {
    setInvoice((prev) => ({
      ...prev,
      dpPercent: 30,
      terminNumber: 2,
      terminPercent: 70,
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
      const outputScale = getAutoScaleForOutput(
        element,
        pageLayout.widthMm,
        pageLayout.heightMm,
      );
      const restoreScaledStyle = applyTemporaryScaleForOutput(element, outputScale);

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
            stripStylesheetsInClone(clonedDocument);
          },
        },
        jsPDF: {
          unit: "mm",
          format: pageLayout.jsPdfFormat,
          orientation: pageOrientation,
        },
      };

      createPdf()
        .set(options)
        .from(element)
        .save()
        .then(() => {
          restoreScaledStyle();
          setIsEditing(wasEditing);
          setIsGenerating(false);
        })
        .catch((error: unknown) => {
          console.error("PDF Error:", error);
          window.alert("Gagal download otomatis. Gunakan tombol Manual.");
          restoreScaledStyle();
          setIsEditing(wasEditing);
          setIsGenerating(false);
        });
    }, 800);
  };

  const handleManualPrint = () => {
    const wasEditing = isEditing;
    setIsEditing(false);

    window.setTimeout(() => {
      const element = contentRef.current;
      if (!element) {
        window.alert("Konten invoice tidak ditemukan.");
        setIsEditing(wasEditing);
        return;
      }

      const outputScale = getAutoScaleForOutput(
        element,
        pageLayout.widthMm,
        pageLayout.heightMm,
      );
      const restoreScaledStyle = applyTemporaryScaleForOutput(element, outputScale);
      window.print();
      restoreScaledStyle();
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
        paperSize={paperSize}
        pageOrientation={pageOrientation}
        toolbarWidthMm={pageLayout.widthMm}
        onResetTermin={setTerminToSecondBilling}
        onToggleEdit={() => setIsEditing((prev) => !prev)}
        onPaperSizeChange={(value) => setPaperSize(value)}
        onPageOrientationChange={(value) => setPageOrientation(value)}
        onManualPrint={handleManualPrint}
        onDownloadPdf={handleDownloadPDF}
        onOpenReceiptPage={() => router.push("/kwitansi")}
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
            width: `${pageLayout.widthMm}mm`,
            minHeight: `${pageLayout.heightMm}mm`,
            padding: `${pageLayout.verticalPaddingMm}mm ${pageLayout.horizontalPaddingMm}mm`,
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
            dpPercent={invoice.dpPercent}
            dpAmount={dpAmount}
            terminNumber={invoice.terminNumber}
            terminPercent={invoice.terminPercent}
            terminAmount={terminAmount}
            isEditing={isEditing}
            formatCurrency={formatCurrencyValue}
            formatPercentage={formatPercentage}
            onDpPercentChange={(value) =>
              updateField("dpPercent", clampPercentage(value))
            }
            onTerminNumberChange={(value) =>
              updateField("terminNumber", normalizeTerminNumber(value))
            }
            onTerminPercentChange={(value) =>
              updateField("terminPercent", clampPercentage(value))
            }
          />

          <InvoiceFooter
            location={invoice.location}
            date={invoice.date}
            sellerName={
              invoice.invoiceTagline.trim().length > 0
                ? invoice.invoiceTagline
                : invoice.sellerName
            }
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
            size: ${pageLayout.widthMm}mm ${pageLayout.heightMm}mm;
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
            width: ${pageLayout.widthMm}mm !important;
            min-height: ${pageLayout.heightMm}mm !important;
            margin: 0 !important;
            padding: ${pageLayout.verticalPaddingMm}mm ${pageLayout.horizontalPaddingMm}mm !important;
            page-break-after: avoid;
          }
        }
      `}</style>
    </div>
  );
}
