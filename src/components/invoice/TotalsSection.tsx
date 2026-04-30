type TotalsSectionProps = {
  subtotal: number;
  dpPercent: number;
  dpAmount: number;
  terminNumber: number;
  terminPercent: number;
  terminAmount: number;
  isEditing: boolean;
  formatCurrency: (value: number) => string;
  formatPercentage: (value: number) => string;
  onDpPercentChange: (value: number) => void;
  onTerminNumberChange: (value: number) => void;
  onTerminPercentChange: (value: number) => void;
};

export default function TotalsSection({
  subtotal,
  dpPercent,
  dpAmount,
  terminNumber,
  terminPercent,
  terminAmount,
  isEditing,
  formatCurrency,
  formatPercentage,
  onDpPercentChange,
  onTerminNumberChange,
  onTerminPercentChange,
}: TotalsSectionProps) {
  const terminLabel = `Termin ke-${terminNumber}`;
  const totalTermPercent = dpPercent + terminPercent;

  return (
    <div className="flex justify-end mb-6">
      <div className="w-[56%] min-w-[320px]">
        <div className="flex justify-between items-center py-1.5 border-b border-gray-200 text-xs">
          <span className="font-medium text-gray-600">Total Nilai Project</span>
          <span className="font-bold text-gray-900">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between items-start gap-3 py-1.5 border-b border-gray-200 px-2 -mx-2 my-1.5 rounded-sm">
          <div className="flex min-w-0 flex-col">
            <span className="font-bold text-xs text-gray-800">
              DP (Termin ke-1)
            </span>

            {isEditing ? (
              <label className="mt-1 flex w-fit items-center gap-1 rounded border border-gray-200 bg-white px-1 py-0.5 text-[10px] font-semibold text-gray-700 print:hidden">
                Persen
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={dpPercent}
                  onChange={(event) =>
                    onDpPercentChange(Number.parseFloat(event.target.value) || 0)
                  }
                  className="w-12 text-right text-xs font-bold outline-none"
                />
                <span className="text-xs font-bold text-blue-600">%</span>
              </label>
            ) : (
              <span className="text-[11px] font-semibold text-gray-600">
                {formatPercentage(dpPercent)}% dari total
              </span>
            )}
          </div>

          <span className="shrink-0 text-xs font-bold text-gray-900">
            {formatCurrency(dpAmount)}
          </span>
        </div>

        <div className="flex justify-between items-start gap-3 py-1.5 border-b border-gray-200 bg-blue-50 px-2 -mx-2 my-1.5 rounded-sm">
          <div className="flex min-w-0 flex-col">
            <span className="font-bold text-xs text-gray-800">
              Tagihan {terminLabel}
            </span>

            {isEditing ? (
              <div className="mt-1 flex flex-wrap items-center gap-2 print:hidden">
                <label className="flex items-center gap-1 rounded border border-blue-200 bg-white px-1 py-0.5 text-[10px] font-semibold text-gray-700">
                  Termin ke
                  <input
                    type="number"
                    min={2}
                    step={1}
                    value={terminNumber}
                    onChange={(event) =>
                      onTerminNumberChange(Number.parseInt(event.target.value, 10) || 2)
                    }
                    className="w-9 text-right text-xs font-bold outline-none"
                  />
                </label>

                <label className="flex items-center gap-1 rounded border border-blue-200 bg-white px-1 py-0.5 text-[10px] font-semibold text-gray-700">
                  Persen
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={terminPercent}
                    onChange={(event) =>
                      onTerminPercentChange(
                        Number.parseFloat(event.target.value) || 0,
                      )
                    }
                    className="w-12 text-right text-xs font-bold outline-none"
                  />
                  <span className="text-xs font-bold text-blue-600">%</span>
                </label>
              </div>
            ) : (
              <span className="text-[11px] font-semibold text-blue-700">
                {formatPercentage(terminPercent)}% dari total
              </span>
            )}

            <span className="text-[10px] text-blue-600 italic mt-0.5">
              *Termin ini adalah tagihan setelah DP.
            </span>
          </div>

          <span className="shrink-0 text-xs font-bold text-gray-900">
            {formatCurrency(terminAmount)}
          </span>
        </div>

        <div className="flex justify-between items-center py-2 border-t-2 border-gray-800">
          <span className="font-bold text-sm text-gray-800">
            {terminLabel}
          </span>
          <span className="font-bold text-lg text-red-600">
            {formatCurrency(terminAmount)}
          </span>
        </div>

        {totalTermPercent > 100 ? (
          <p className="mt-1 text-[10px] font-semibold text-red-600">
            Total persentase DP dan termin aktif melebihi 100%.
          </p>
        ) : null}
      </div>
    </div>
  );
}
