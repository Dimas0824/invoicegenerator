import type { ReceiptStatus } from "./types";

type ReceiptSectionProps = {
  receiptStatus: ReceiptStatus;
  subtotal: number;
  dpAmount: number;
  balance: number;
  formatCurrency: (value: number) => string;
};

export default function ReceiptSection({
  receiptStatus,
  subtotal,
  dpAmount,
  balance,
  formatCurrency,
}: ReceiptSectionProps) {
  const safeBalance = Math.max(balance, 0);

  const receiptMeta = {
    "Termin Pertama": {
      amount: dpAmount,
      className: "bg-blue-100 text-blue-700",
      note: "Kwitansi diterbitkan untuk pembayaran termin pertama (uang muka).",
    },
    "Termin Kedua": {
      amount: safeBalance,
      className: "bg-gray-100 text-gray-700",
      note: "Kwitansi diterbitkan untuk pembayaran termin kedua (sisa tagihan).",
    },
    Full: {
      amount: subtotal,
      className: "bg-red-50 text-red-700",
      note: "Kwitansi diterbitkan untuk pembayaran penuh sesuai total invoice.",
    },
  } as const;

  const activeReceipt = receiptMeta[receiptStatus];

  return (
    <div className="mb-5 border border-gray-200 rounded-md overflow-hidden">
      <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
          Kwitansi Pembayaran
        </h3>
        <span
          className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${activeReceipt.className}`}
        >
          {receiptStatus}
        </span>
      </div>

      <div className="px-3 py-2">
        <div className="flex justify-between items-center py-1">
          <span className="text-xs text-gray-600">Nominal Diterima</span>
          <span className="text-sm font-bold text-gray-900">
            {formatCurrency(activeReceipt.amount)}
          </span>
        </div>

        <p className="text-[10px] text-gray-500 mt-1">{activeReceipt.note}</p>
      </div>
    </div>
  );
}
