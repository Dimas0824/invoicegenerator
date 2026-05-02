"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import { useInvoiceSession } from "../../context/InvoiceSessionContext";
import { formatCurrency, formatDate } from "../invoice/utils";
import { RECEIPT_PAGE_LAYOUT } from "./constants";
import ReceiptDocument from "./ReceiptDocument";
import ReceiptToolbar from "./ReceiptToolbar";
import type { ReceiptDraftData } from "./types";
import { buildReceiptData, createReceiptDraftFromInvoice } from "./utils";

const OUTPUT_SAFE_SCALE_MARGIN = 0.97;

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

  element.style.transformOrigin = "top left";
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [receiptDraftOverride, setReceiptDraftOverride] =
    useState<ReceiptDraftData | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const generatedReceiptDraft = useMemo(
    () => (invoiceDraft ? createReceiptDraftFromInvoice(invoiceDraft) : null),
    [invoiceDraft],
  );
  const receiptDraft = receiptDraftOverride ?? generatedReceiptDraft;

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
    setReceiptDraftOverride((prev) => {
      const baseDraft = prev ?? generatedReceiptDraft;
      if (!baseDraft) {
        return prev;
      }

      return {
        ...baseDraft,
        [field]: value,
      };
    });
  };

  const handleManualPrint = () => {
    const wasEditing = isEditing;
    setIsGenerating(true);
    setIsEditing(false);

    window.setTimeout(() => {
      const element = contentRef.current;
      if (!element) {
        window.alert("Konten kwitansi tidak ditemukan.");
        setIsEditing(wasEditing);
        setIsGenerating(false);
        return;
      }

      const outputScale = getAutoScaleForOutput(
        element,
        RECEIPT_PAGE_LAYOUT.widthMm,
        RECEIPT_PAGE_LAYOUT.heightMm,
      );
      const restoreScaledStyle = applyTemporaryScaleForOutput(element, outputScale);

      // Native print uses the same CSS as the live preview, so invoice and
      // receipt exports stay visually consistent.
      let hasRestoredPrintState = false;
      const restoreAfterPrint = () => {
        if (hasRestoredPrintState) {
          return;
        }

        hasRestoredPrintState = true;
        restoreScaledStyle();
        setIsEditing(wasEditing);
        setIsGenerating(false);
        window.removeEventListener("afterprint", restoreAfterPrint);
      };

      window.addEventListener("afterprint", restoreAfterPrint);
      window.print();

      window.setTimeout(restoreAfterPrint, 1000);
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
    <div className="min-h-screen bg-gray-200 font-sans p-3 flex flex-col items-center">
      <ReceiptToolbar
        isEditing={isEditing}
        isGenerating={isGenerating}
        terminLabel={receipt.terminLabel}
        terminPercent={receipt.terminPercent}
        toolbarWidthMm={RECEIPT_PAGE_LAYOUT.widthMm}
        onToggleEdit={() => setIsEditing((prev) => !prev)}
        onBackToInvoice={() => router.push("/invoice")}
        onManualPrint={handleManualPrint}
      />

      <div className="overflow-auto w-full flex justify-center pb-10 print:pb-0 transition-all duration-200">
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
            margin: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden;
          }

          #receipt-content,
          #receipt-content * {
            visibility: visible;
          }

          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:pb-0 { padding-bottom: 0 !important; }

          #receipt-content {
            position: absolute !important;
            inset: 0 auto auto 0 !important;
            width: ${RECEIPT_PAGE_LAYOUT.widthMm}mm !important;
            min-height: ${RECEIPT_PAGE_LAYOUT.heightMm}mm !important;
            margin: 0 !important;
            padding: ${RECEIPT_PAGE_LAYOUT.verticalPaddingMm}mm ${RECEIPT_PAGE_LAYOUT.horizontalPaddingMm}mm !important;
            background: white !important;
            color: #0f172a !important;
            page-break-after: avoid;
          }
        }
      `}</style>
    </div>
  );
}
