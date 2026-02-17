"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

import { useInvoiceSession } from "../../context/InvoiceSessionContext";
import { formatCurrency, formatDate } from "../invoice/utils";
import { RECEIPT_PAGE_LAYOUT } from "./constants";
import ReceiptDocument from "./ReceiptDocument";
import ReceiptToolbar from "./ReceiptToolbar";
import type { ReceiptDraftData } from "./types";
import { buildReceiptData, createReceiptDraftFromInvoice } from "./utils";

const UNSUPPORTED_COLOR_FUNCTION_PATTERN =
  /\b(?:lab|lch|oklab|oklch|color)\(/i;
const OUTPUT_SAFE_SCALE_MARGIN = 0.97;

type CssVarStyle = CSSProperties & Record<`--${string}`, string>;

const PDF_SAFE_TAILWIND_COLOR_VARS: CssVarStyle = {
  "--color-white": "#ffffff",
  "--color-gray-50": "#f9fafb",
  "--color-gray-100": "#f3f4f6",
  "--color-gray-200": "#e5e7eb",
  "--color-gray-300": "#d1d5db",
  "--color-gray-400": "#9ca3af",
  "--color-gray-500": "#6b7280",
  "--color-gray-600": "#4b5563",
  "--color-gray-700": "#374151",
  "--color-gray-800": "#1f2937",
  "--color-gray-900": "#111827",
  "--color-blue-50": "#eff6ff",
  "--color-blue-200": "#bfdbfe",
  "--color-blue-500": "#3b82f6",
  "--color-slate-800": "#1e293b",
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

export default function ReceiptGenerator() {
  const router = useRouter();
  const { invoiceDraft } = useInvoiceSession();
  const [isEditing, setIsEditing] = useState(true);
  const [isPdfReady, setIsPdfReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [receiptDraft, setReceiptDraft] = useState<ReceiptDraftData | null>(() =>
    invoiceDraft ? createReceiptDraftFromInvoice(invoiceDraft) : null,
  );
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!invoiceDraft || receiptDraft) {
      return;
    }

    setReceiptDraft(createReceiptDraftFromInvoice(invoiceDraft));
  }, [invoiceDraft, receiptDraft]);

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

  const receipt = useMemo(() => {
    if (!invoiceDraft || !receiptDraft) {
      return null;
    }

    return buildReceiptData(invoiceDraft, receiptDraft);
  }, [invoiceDraft, receiptDraft]);

  const paymentInfo = useMemo(() => {
    if (!invoiceDraft) {
      return null;
    }

    return {
      orderId: invoiceDraft.orderId,
      paymentMethod: invoiceDraft.paymentMethod,
      bankName: invoiceDraft.bankName,
      accountNumber: invoiceDraft.accountNumber,
      recipientName: invoiceDraft.recipientName,
    };
  }, [invoiceDraft]);

  const formatCurrencyValue = (amount: number): string => {
    const currency = receipt?.currency || invoiceDraft?.currency || "IDR";
    return formatCurrency(amount, currency);
  };

  const updateField = <K extends keyof ReceiptDraftData>(
    field: K,
    value: ReceiptDraftData[K],
  ): void => {
    setReceiptDraft((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleDownloadPDF = () => {
    const createPdf = window.html2pdf;
    if (!createPdf || !isPdfReady) {
      window.alert("Library PDF belum siap. Silakan gunakan tombol Manual Print.");
      return;
    }

    const element = contentRef.current;
    if (!element || !receipt) {
      window.alert("Konten kwitansi tidak ditemukan.");
      return;
    }

    setIsGenerating(true);
    const wasEditing = isEditing;
    setIsEditing(false);

    window.setTimeout(() => {
      const outputScale = getAutoScaleForOutput(
        element,
        RECEIPT_PAGE_LAYOUT.widthMm,
        RECEIPT_PAGE_LAYOUT.heightMm,
      );
      const restoreScaledStyle = applyTemporaryScaleForOutput(element, outputScale);

      const options = {
        margin: 0,
        filename: `Kwitansi-${receipt.receiptNumber || "penerimaan-dana"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          scrollY: 0,
          scrollX: 0,
          onclone: (clonedDocument: Document) => {
            const cloneElement = clonedDocument.getElementById("receipt-content");
            if (!(cloneElement instanceof HTMLElement)) {
              return;
            }

            syncComputedStylesForPdf(element, cloneElement);
            stripStylesheetsInClone(clonedDocument);
          },
        },
        jsPDF: {
          unit: "mm",
          format: RECEIPT_PAGE_LAYOUT.jsPdfFormat,
          orientation: "portrait",
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
        window.alert("Konten kwitansi tidak ditemukan.");
        setIsEditing(wasEditing);
        return;
      }

      const outputScale = getAutoScaleForOutput(
        element,
        RECEIPT_PAGE_LAYOUT.widthMm,
        RECEIPT_PAGE_LAYOUT.heightMm,
      );
      const restoreScaledStyle = applyTemporaryScaleForOutput(element, outputScale);
      window.print();
      restoreScaledStyle();
      setIsEditing(wasEditing);
    }, 500);
  };

  if (!invoiceDraft || !receipt || !receiptDraft || !paymentInfo) {
    return (
      <div className="min-h-screen bg-gray-200 p-4 flex items-center justify-center">
        <div className="bg-white border border-gray-300 rounded-lg shadow-md p-6 max-w-lg text-center">
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            Data invoice belum tersedia di sesi ini.
          </h1>
          <p className="text-sm text-gray-600 mb-5">
            Silakan kembali ke halaman invoice, isi datanya, lalu terbitkan kwitansi.
          </p>
          <button
            onClick={() => router.push("/invoice")}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition"
          >
            Kembali ke Invoice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-200 font-sans p-3 flex flex-col items-center"
      style={PDF_SAFE_TAILWIND_COLOR_VARS}
    >
      <ReceiptToolbar
        isEditing={isEditing}
        isGenerating={isGenerating}
        receiptStatus={receiptDraft.receiptStatus}
        toolbarWidthMm={RECEIPT_PAGE_LAYOUT.widthMm}
        onToggleEdit={() => setIsEditing((prev) => !prev)}
        onReceiptStatusChange={(value) => updateField("receiptStatus", value)}
        onBackToInvoice={() => router.push("/invoice")}
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
          id="receipt-content"
          className="bg-white shadow-2xl print:shadow-none relative box-border text-slate-900 leading-tight"
          style={{
            width: `${RECEIPT_PAGE_LAYOUT.widthMm}mm`,
            minHeight: `${RECEIPT_PAGE_LAYOUT.heightMm}mm`,
            padding: `${RECEIPT_PAGE_LAYOUT.verticalPaddingMm}mm ${RECEIPT_PAGE_LAYOUT.horizontalPaddingMm}mm`,
            flexShrink: 0,
          }}
        >
          <ReceiptDocument
            receipt={receipt}
            paymentInfo={paymentInfo}
            isEditing={isEditing}
            formatCurrency={formatCurrencyValue}
            formatDate={formatDate}
            onFieldChange={updateField}
          />
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: ${RECEIPT_PAGE_LAYOUT.widthMm}mm ${RECEIPT_PAGE_LAYOUT.heightMm}mm;
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

          #receipt-content {
            width: ${RECEIPT_PAGE_LAYOUT.widthMm}mm !important;
            min-height: ${RECEIPT_PAGE_LAYOUT.heightMm}mm !important;
            margin: 0 !important;
            padding: ${RECEIPT_PAGE_LAYOUT.verticalPaddingMm}mm ${RECEIPT_PAGE_LAYOUT.horizontalPaddingMm}mm !important;
            page-break-after: avoid;
          }
        }
      `}</style>
    </div>
  );
}
