import { Download, Printer } from "lucide-react";

type ToolbarProps = {
  isEditing: boolean;
  isGenerating: boolean;
  onResetDp: () => void;
  onToggleEdit: () => void;
  onManualPrint: () => void;
  onDownloadPdf: () => void;
};

export default function Toolbar({
  isEditing,
  isGenerating,
  onResetDp,
  onToggleEdit,
  onManualPrint,
  onDownloadPdf,
}: ToolbarProps) {
  return (
    <div className="w-full max-w-[210mm] mb-6 flex flex-wrap justify-between items-center print:hidden bg-white p-4 rounded-lg shadow-md gap-4 sticky top-4 z-50 border border-gray-300">
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
