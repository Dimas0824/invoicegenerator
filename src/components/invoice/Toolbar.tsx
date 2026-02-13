import { Download, Printer } from "lucide-react";
import {
  PAGE_ORIENTATION_OPTIONS,
  PAPER_SIZE_OPTIONS,
  RECEIPT_STATUS_OPTIONS,
} from "./constants";
import type { PageOrientation, PaperSize, ReceiptStatus } from "./types";

type ToolbarProps = {
  isEditing: boolean;
  isGenerating: boolean;
  showReceipt: boolean;
  receiptStatus: ReceiptStatus;
  paperSize: PaperSize;
  pageOrientation: PageOrientation;
  toolbarWidthMm: number;
  onResetDp: () => void;
  onToggleEdit: () => void;
  onToggleReceipt: () => void;
  onReceiptStatusChange: (value: ReceiptStatus) => void;
  onPaperSizeChange: (value: PaperSize) => void;
  onPageOrientationChange: (value: PageOrientation) => void;
  onManualPrint: () => void;
  onDownloadPdf: () => void;
};

export default function Toolbar({
  isEditing,
  isGenerating,
  showReceipt,
  receiptStatus,
  paperSize,
  pageOrientation,
  toolbarWidthMm,
  onResetDp,
  onToggleEdit,
  onToggleReceipt,
  onReceiptStatusChange,
  onPaperSizeChange,
  onPageOrientationChange,
  onManualPrint,
  onDownloadPdf,
}: ToolbarProps) {
  return (
    <div
      className="w-full mb-6 flex flex-wrap justify-between items-center print:hidden bg-white p-4 rounded-lg shadow-md gap-4 sticky top-4 z-50 border border-gray-300"
      style={{ maxWidth: `${toolbarWidthMm}mm` }}
    >
      <div>
        <h1 className="text-lg font-bold text-gray-800">Invoice Generator</h1>
        <p className="text-xs text-gray-500">
          PDF Auto: Pastikan layout bergeser ke kiri saat proses.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={onResetDp}
          disabled={isGenerating}
          className="px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 rounded border border-blue-200 hover:bg-blue-100 transition"
        >
          Reset DP 30%
        </button>

        <button
          onClick={onToggleEdit}
          disabled={isGenerating}
          className="px-3 py-2 text-xs font-bold text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition border border-gray-300"
        >
          {isEditing ? "Preview Mode" : "Edit Mode"}
        </button>

        <button
          onClick={onManualPrint}
          disabled={isGenerating}
          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-700 bg-white border-2 border-gray-800 rounded hover:bg-gray-50 transition"
        >
          <Printer size={16} /> Print Manual
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleReceipt}
            disabled={isGenerating}
            className={`px-3 py-2 text-xs font-bold rounded border transition ${
              showReceipt
                ? "text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100"
                : "text-gray-700 bg-gray-100 border-gray-300 hover:bg-gray-200"
            }`}
          >
            {showReceipt ? "Kwitansi Aktif" : "Terbitkan Kwitansi"}
          </button>

          {showReceipt ? (
            <select
              value={receiptStatus}
              onChange={(event) =>
                onReceiptStatusChange(event.target.value as ReceiptStatus)
              }
              disabled={isGenerating || !isEditing}
              className="px-2 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded outline-none focus:border-blue-500 disabled:bg-gray-100"
            >
              {RECEIPT_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={paperSize}
            onChange={(event) => onPaperSizeChange(event.target.value as PaperSize)}
            disabled={isGenerating}
            className="px-2 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded outline-none focus:border-blue-500 disabled:bg-gray-100"
            title="Ukuran Kertas"
          >
            {PAPER_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                Kertas: {option}
              </option>
            ))}
          </select>

          <select
            value={pageOrientation}
            onChange={(event) =>
              onPageOrientationChange(event.target.value as PageOrientation)
            }
            disabled={isGenerating}
            className="px-2 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded outline-none focus:border-blue-500 disabled:bg-gray-100"
            title="Orientasi Kertas"
          >
            {PAGE_ORIENTATION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "portrait" ? "Portrait" : "Landscape"}
              </option>
            ))}
          </select>
        </div>

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
