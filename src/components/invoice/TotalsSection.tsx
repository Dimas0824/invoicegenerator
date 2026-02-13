type TotalsSectionProps = {
  subtotal: number;
  dpValue: number;
  dpAmount: number;
  balance: number;
  isEditing: boolean;
  formatCurrency: (value: number) => string;
  onDpValueChange: (value: number) => void;
};

export default function TotalsSection({
  subtotal,
  dpValue,
  dpAmount,
  balance,
  isEditing,
  formatCurrency,
  onDpValueChange,
}: TotalsSectionProps) {
  return (
    <div className="flex justify-end mb-6">
      <div className="w-[46%]">
        <div className="flex justify-between items-center py-1.5 border-b border-gray-200 text-xs">
          <span className="font-medium text-gray-600">Total Biaya Project</span>
          <span className="font-bold text-gray-900">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between items-center py-1.5 border-b border-gray-200 bg-blue-50 px-2 -mx-2 my-1.5 rounded-sm">
          <div className="flex flex-col">
            <span className="font-bold text-xs text-gray-800">DP (Uang Muka)</span>
            <span className="text-[10px] text-blue-600 italic mt-0.5">
              *Pembayaran awal untuk mulai pengerjaan
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {isEditing ? (
              <div className="flex items-center gap-1 mr-1 print:hidden bg-white rounded px-1 border border-blue-200">
                <input
                  type="number"
                  value={dpValue}
                  onChange={(event) =>
                    onDpValueChange(Number.parseFloat(event.target.value) || 0)
                  }
                  className="w-10 text-right text-xs outline-none"
                />
                <span className="text-xs font-bold text-blue-600">%</span>
              </div>
            ) : null}

            <span className="font-bold text-gray-900">{formatCurrency(dpAmount)}</span>
          </div>
        </div>

        <div className="flex justify-between items-center py-2 border-t-2 border-gray-800">
          <span className="font-bold text-sm text-gray-800">
            Pelunasan (Saat Selesai)
          </span>
          <span className="font-bold text-lg text-red-600">
            {formatCurrency(balance)}
          </span>
        </div>
      </div>
    </div>
  );
}
