import { PAYMENT_METHOD_OPTIONS } from "./constants";
import type { PaymentMethod } from "./types";

type InfoSectionProps = {
  buyerName: string;
  date: string;
  paymentMethod: PaymentMethod;
  isEditing: boolean;
  formatDate: (value: string) => string;
  onBuyerNameChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onPaymentMethodChange: (value: PaymentMethod) => void;
};

export default function InfoSection({
  buyerName,
  date,
  paymentMethod,
  isEditing,
  formatDate,
  onBuyerNameChange,
  onDateChange,
  onPaymentMethodChange,
}: InfoSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-8 mb-8">
      <div className="bg-gray-50 p-4 rounded border border-gray-200">
        <h3 className="text-xs font-bold text-gray-800 uppercase border-b border-gray-300 pb-2 mb-3 tracking-wider">
          Info Klien
        </h3>

        <div>
          <label className="text-[10px] text-gray-500 uppercase block mb-1 font-semibold">
            Nama Klien / Instansi
          </label>
          {isEditing ? (
            <input
              type="text"
              name="buyerName"
              value={buyerName}
              onChange={(event) => onBuyerNameChange(event.target.value)}
              className="w-full text-base font-bold text-gray-800 bg-white border border-gray-300 p-1 rounded focus:border-blue-500 outline-none"
            />
          ) : (
            <p className="text-base font-bold text-gray-900">{buyerName}</p>
          )}
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded border border-gray-200">
        <h3 className="text-xs font-bold text-gray-800 uppercase border-b border-gray-300 pb-2 mb-3 tracking-wider">
          Detail Pembayaran
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[10px] text-gray-500 uppercase font-semibold">
              Tanggal Invoice
            </label>

            {isEditing ? (
              <input
                type="date"
                name="date"
                value={date}
                onChange={(event) => onDateChange(event.target.value)}
                className="text-sm font-medium text-gray-800 bg-white border border-gray-300 p-1 rounded focus:border-blue-500 outline-none"
              />
            ) : (
              <p className="text-sm font-medium text-gray-800">{formatDate(date)}</p>
            )}
          </div>

          <div className="flex justify-between items-center">
            <label className="text-[10px] text-gray-500 uppercase font-semibold">
              Metode Pembayaran
            </label>

            {isEditing ? (
              <select
                name="paymentMethod"
                value={paymentMethod}
                onChange={(event) =>
                  onPaymentMethodChange(event.target.value as PaymentMethod)
                }
                className="text-sm font-medium text-gray-800 bg-white border border-gray-300 p-1 rounded focus:border-blue-500 outline-none w-32"
              >
                {PAYMENT_METHOD_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm font-medium text-gray-800">{paymentMethod}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
