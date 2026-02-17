import { Download, Printer } from "lucide-react";

import { RECEIPT_STATUS_OPTIONS } from "./constants";
import type { ReceiptStatus } from "./types";

type ReceiptToolbarProps = {
  isEditing: boolean;
  isGenerating: boolean;
  receiptStatus: ReceiptStatus;
  toolbarWidthMm: number;
  onToggleEdit: () => void;
  onReceiptStatusChange: (value: ReceiptStatus) => void;
  onBackToInvoice: () => void;
  onManualPrint: () => void;
  onDownloadPdf: () => void;
};

export default function ReceiptToolbar({
  isEditing,
  isGenerating,
  receiptStatus,
  toolbarWidthMm,
  onToggleEdit,
  onReceiptStatusChange,
  onBackToInvoice,
  onManualPrint,
  onDownloadPdf,
}: ReceiptToolbarProps) {
  return (
    <div
      className="w-full mb-6 flex flex-wrap justify-between items-center print:hidden bg-white p-4 rounded-lg shadow-md gap-4 sticky top-4 z-50 border border-gray-300"
      style={{ maxWidth: `${toolbarWidthMm}mm` }}
    >
      <div>
        <h1 className="text-lg font-bold text-gray-800">Kwitansi Penerimaan Dana</h1>
        <p className="text-xs text-gray-500">Format legal standar Indonesia.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={onBackToInvoice}
          disabled={isGenerating}
          className="px-3 py-2 text-xs font-bold text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition border border-gray-300"
        >
          Kembali ke Invoice
        </button>

        <button
          onClick={onToggleEdit}
          disabled={isGenerating}
          className="px-3 py-2 text-xs font-bold text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition border border-gray-300"
        >
          {isEditing ? "Preview Mode" : "Edit Mode"}
        </button>

        <select
          value={receiptStatus}
          onChange={(event) => onReceiptStatusChange(event.target.value as ReceiptStatus)}
          disabled={isGenerating || !isEditing}
          className="px-2 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded outline-none focus:border-blue-500 disabled:bg-gray-100"
        >
          {RECEIPT_STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <button
          onClick={onManualPrint}
          disabled={isGenerating}
          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-700 bg-white border-2 border-gray-800 rounded hover:bg-gray-50 transition"
        >
          <Printer size={16} /> Print Manual
        </button>

        <button
          onClick={onDownloadPdf}
          disabled={isGenerating}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold text-white rounded shadow-sm transition ${
            isGenerating ? "bg-gray-500 cursor-wait" : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {isGenerating ? (
            "Memproses..."
          ) : (
            <>
              <Download size={16} /> Download PDF (Auto)
            </>
          )}
        </button>
      </div>
    </div>
  );
}
