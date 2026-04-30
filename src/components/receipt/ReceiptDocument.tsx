import type { ReceiptData, ReceiptDraftData, ReceiptPaymentInfo } from "./types";
import { formatPercentage } from "../invoice/utils";
import { formatEmptyValue } from "./utils";

type ReceiptDocumentProps = {
  receipt: ReceiptData;
  paymentInfo: ReceiptPaymentInfo;
  isEditing: boolean;
  formatCurrency: (value: number) => string;
  formatDate: (value: string) => string;
  onFieldChange: <K extends keyof ReceiptDraftData>(
    field: K,
    value: ReceiptDraftData[K],
  ) => void;
};

function EditableOrStaticText({
  value,
  isEditing,
  onChange,
  className,
  multiline = false,
}: {
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  className: string;
  multiline?: boolean;
}) {
  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={2}
          className={`${className} border border-dashed border-gray-300 p-1 rounded resize-none outline-none focus:border-blue-500`}
        />
      );
    }

    return (
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${className} border-b border-dashed border-gray-300 outline-none focus:border-blue-500`}
      />
    );
  }

  return <p className={className}>{formatEmptyValue(value)}</p>;
}

export default function ReceiptDocument({
  receipt,
  paymentInfo,
  isEditing,
  formatCurrency,
  formatDate,
  onFieldChange,
}: ReceiptDocumentProps) {
  const terminDescription = `${receipt.terminLabel} (${formatPercentage(
    receipt.terminPercent,
  )}% dari total invoice)`;

  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-5 border-b-2 border-gray-800 pb-3">
        <h1 className="text-3xl font-extrabold uppercase tracking-[0.25em] text-slate-800 leading-none">
          KWITANSI
        </h1>

        <div className="mt-2 text-sm text-gray-600 flex justify-center items-center gap-2">
          <span className="font-semibold">Nomor:</span>
          {isEditing ? (
            <input
              type="text"
              value={receipt.receiptNumber}
              onChange={(event) => onFieldChange("receiptNumber", event.target.value)}
              className="font-mono font-bold text-gray-800 border-b border-dashed border-gray-300 focus:border-blue-500 outline-none text-center bg-blue-50 px-1 min-w-60"
            />
          ) : (
            <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
              {formatEmptyValue(receipt.receiptNumber)}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-[180px_1fr] gap-3 items-start">
          <p className="font-semibold text-gray-700">Sudah terima dari</p>
          <EditableOrStaticText
            value={receipt.receivedFrom}
            isEditing={isEditing}
            onChange={(value) => onFieldChange("receivedFrom", value)}
            className="font-bold text-gray-900"
          />
        </div>

        <div className="grid grid-cols-[180px_1fr] gap-3 items-start">
          <p className="font-semibold text-gray-700">Uang sejumlah</p>
          <div>
            <p className="font-bold text-lg text-gray-900">
              {formatCurrency(receipt.amountReceived)}
            </p>
            <p className="text-xs italic text-gray-600 mt-0.5">
              ({formatEmptyValue(receipt.amountInWords)})
            </p>
          </div>
        </div>

        <div className="grid grid-cols-[180px_1fr] gap-3 items-start">
          <p className="font-semibold text-gray-700">Untuk pembayaran</p>
          <EditableOrStaticText
            value={receipt.paymentFor}
            isEditing={isEditing}
            onChange={(value) => onFieldChange("paymentFor", value)}
            className="font-medium text-gray-900 w-full"
            multiline
          />
        </div>

        <div className="grid grid-cols-[180px_1fr] gap-3 items-start">
          <p className="font-semibold text-gray-700">Keterangan termin</p>
          <p className="font-bold text-gray-900">{terminDescription}</p>
        </div>

        <div className="grid grid-cols-[180px_1fr] gap-3 items-start">
          <p className="font-semibold text-gray-700">Referensi invoice</p>
          <p className="font-mono font-bold text-gray-900">
            {formatEmptyValue(paymentInfo.orderId)}
          </p>
        </div>

        <div className="grid grid-cols-[180px_1fr] gap-3 items-start">
          <p className="font-semibold text-gray-700">Metode pembayaran</p>
          <div className="space-y-1.5">
            <p className="font-bold text-gray-900">
              {formatEmptyValue(paymentInfo.paymentMethod)}
            </p>
            {paymentInfo.paymentMethod === "Transfer" ? (
              <div className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded p-2 space-y-1">
                <p>
                  Bank: <span className="font-semibold">{formatEmptyValue(paymentInfo.bankName)}</span>
                </p>
                <p>
                  No. Rekening:{" "}
                  <span className="font-semibold">
                    {formatEmptyValue(paymentInfo.accountNumber)}
                  </span>
                </p>
                <p>
                  Atas Nama:{" "}
                  <span className="font-semibold">
                    {formatEmptyValue(paymentInfo.recipientName)}
                  </span>
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 flex justify-end">
        <div className="w-64 text-sm text-center">
          <div className="text-gray-700 mb-1">
            {isEditing ? (
              <input
                value={receipt.location}
                onChange={(event) => onFieldChange("location", event.target.value)}
                className="w-24 text-right border-b border-dashed border-gray-300 outline-none focus:border-blue-500"
              />
            ) : (
              formatEmptyValue(receipt.location)
            )}
            ,{" "}
            {isEditing ? (
              <input
                type="date"
                value={receipt.receiptDate}
                onChange={(event) => onFieldChange("receiptDate", event.target.value)}
                className="text-xs border border-gray-300 rounded p-1 ml-1"
              />
            ) : (
              formatDate(receipt.receiptDate)
            )}
          </div>

          <p className="font-medium text-gray-700">Penerima,</p>

          <div className="h-20 mt-3" aria-hidden="true" />

          <div className="mt-4">
            <EditableOrStaticText
              value={receipt.receivedBy}
              isEditing={isEditing}
              onChange={(value) => onFieldChange("receivedBy", value)}
              className="font-bold text-gray-800 text-center w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
