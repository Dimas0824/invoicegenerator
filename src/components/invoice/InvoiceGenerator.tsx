"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

const OUTPUT_SAFE_SCALE_MARGIN = 0.97;

type LegacyInvoiceData = Partial<InvoiceData> & {
  dpValue?: number;
};

const PAGE_SIZE_DIMENSIONS: Record<
  PaperSize,
  {
    widthMm: number;
    heightMm: number;
  }
> = {
  A5: { widthMm: 148, heightMm: 210 },
  A4: { widthMm: 210, heightMm: 297 },
  A3: { widthMm: 297, heightMm: 420 },
  Letter: { widthMm: 216, heightMm: 279 },
  Legal: { widthMm: 216, heightMm: 356 },
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

export default function InvoiceGenerator() {
  const router = useRouter();
  const { invoiceDraft, setInvoiceDraft } = useInvoiceSession();
  const [invoice, setInvoice] = useState<InvoiceData>(
    () => normalizeInvoiceData(invoiceDraft),
  );
  const [isEditing, setIsEditing] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [paperSize, setPaperSize] = useState<PaperSize>("A4");
  const [pageOrientation, setPageOrientation] = useState<PageOrientation>("portrait");
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setInvoiceDraft(invoice);
  }, [invoice, setInvoiceDraft]);

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

  const handleManualPrint = () => {
    const wasEditing = isEditing;
    setIsGenerating(true);
    setIsEditing(false);

    window.setTimeout(() => {
      const element = contentRef.current;
      if (!element) {
        window.alert("Konten invoice tidak ditemukan.");
        setIsEditing(wasEditing);
        setIsGenerating(false);
        return;
      }

      const outputScale = getAutoScaleForOutput(
        element,
        pageLayout.widthMm,
        pageLayout.heightMm,
      );
      const restoreScaledStyle = applyTemporaryScaleForOutput(element, outputScale);

      // Native print keeps the same browser-rendered CSS as the preview, avoiding
      // cloned-DOM styling differences that caused inconsistent PDF layouts.
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

  return (
    <div
      className="min-h-screen bg-gray-200 font-sans p-3 flex flex-col items-center"
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
        onOpenReceiptPage={() => router.push("/kwitansi")}
      />

      <div
        className="overflow-auto w-full flex justify-center pb-10 print:pb-0 transition-all duration-200"
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
            margin: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden;
          }

          #invoice-content,
          #invoice-content * {
            visibility: visible;
          }

          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:pb-0 { padding-bottom: 0 !important; }

          #invoice-content {
            position: absolute !important;
            inset: 0 auto auto 0 !important;
            width: ${pageLayout.widthMm}mm !important;
            min-height: ${pageLayout.heightMm}mm !important;
            margin: 0 !important;
            padding: ${pageLayout.verticalPaddingMm}mm ${pageLayout.horizontalPaddingMm}mm !important;
            background: white !important;
            color: #0f172a !important;
            page-break-after: avoid;
          }
        }
      `}</style>
    </div>
  );
}
