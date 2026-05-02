import { Printer } from "lucide-react";
import { PAGE_ORIENTATION_OPTIONS, PAPER_SIZE_OPTIONS } from "./constants";
import type { PageOrientation, PaperSize } from "./types";

type ToolbarProps = {
  isEditing: boolean;
  isGenerating: boolean;
  paperSize: PaperSize;
  pageOrientation: PageOrientation;
  toolbarWidthMm: number;
  brandColor: string;
  hasBrandLogo: boolean;
  onResetTermin: () => void;
  onToggleEdit: () => void;
  onPaperSizeChange: (value: PaperSize) => void;
  onPageOrientationChange: (value: PageOrientation) => void;
  onBrandColorChange: (value: string) => void;
  onBrandLogoUpload: (file: File) => void;
  onBrandLogoClear: () => void;
  onManualPrint: () => void;
  onOpenReceiptPage: () => void;
};

export default function Toolbar({
  isEditing,
  isGenerating,
  paperSize,
  pageOrientation,
  toolbarWidthMm,
  brandColor,
  hasBrandLogo,
  onResetTermin,
  onToggleEdit,
  onPaperSizeChange,
  onPageOrientationChange,
  onBrandColorChange,
  onBrandLogoUpload,
  onBrandLogoClear,
  onManualPrint,
  onOpenReceiptPage,
}: ToolbarProps) {
  return (
    <div
      className="w-full mb-6 flex flex-wrap justify-between items-center print:hidden bg-white p-4 rounded-lg shadow-md gap-4 sticky top-4 z-50 border border-gray-300"
      style={{ maxWidth: `${toolbarWidthMm}mm` }}
    >
      <div>
        <h1 className="text-lg font-bold text-gray-800">Invoice Generator</h1>
        <p className="text-xs text-gray-500">
          Upload logo akan mengganti watermark SVG default.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={onResetTermin}
          disabled={isGenerating}
          className="px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 rounded border border-blue-200 hover:bg-blue-100 transition"
        >
          Reset DP 30% + Termin 2 70%
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
          <Printer size={16} /> Cetak / Simpan PDF
        </button>

        <button
          onClick={onOpenReceiptPage}
          disabled={isGenerating}
          className="px-3 py-2 text-xs font-bold rounded border transition text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100"
        >
          Terbitkan Kwitansi
        </button>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded">
            Warna
            <input
              type="color"
              value={brandColor}
              onChange={(event) => onBrandColorChange(event.target.value)}
              disabled={isGenerating}
              className="h-6 w-8 cursor-pointer rounded border border-gray-300 bg-white p-0 disabled:cursor-not-allowed"
              title="Warna brand dokumen"
            />
          </label>

          <label className="flex cursor-pointer items-center gap-2 px-2 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50">
            Upload Logo
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={isGenerating}
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  onBrandLogoUpload(file);
                }

                event.target.value = "";
              }}
            />
          </label>

          {hasBrandLogo ? (
            <button
              type="button"
              onClick={onBrandLogoClear}
              disabled={isGenerating}
              className="px-2 py-2 text-xs font-bold text-red-700 bg-red-50 rounded border border-red-200 hover:bg-red-100 transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              Hapus Logo
            </button>
          ) : null}

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

        {isGenerating ? (
          <span className="px-3 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded border border-gray-300">
            Menyiapkan layout...
          </span>
        ) : null}
      </div>
    </div>
  );
}
