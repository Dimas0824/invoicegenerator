import { BANK_OPTIONS, PAYMENT_METHOD_OPTIONS } from "./constants";
import type { BankName, PaymentMethod } from "./types";

type InfoSectionProps = {
  buyerName: string;
  date: string;
  paymentMethod: PaymentMethod;
  bankName: BankName;
  accountNumber: string;
  recipientName: string;
  isEditing: boolean;
  formatDate: (value: string) => string;
  onBuyerNameChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onPaymentMethodChange: (value: PaymentMethod) => void;
  onBankNameChange: (value: BankName) => void;
  onAccountNumberChange: (value: string) => void;
  onRecipientNameChange: (value: string) => void;
};

export default function InfoSection({
  buyerName,
  date,
  paymentMethod,
  bankName,
  accountNumber,
  recipientName,
  isEditing,
  formatDate,
  onBuyerNameChange,
  onDateChange,
  onPaymentMethodChange,
  onBankNameChange,
  onAccountNumberChange,
  onRecipientNameChange,
}: InfoSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-5 mb-5">
      <div className="bg-gray-50 p-3 rounded border border-gray-200">
        <h3 className="text-[11px] font-bold text-gray-800 uppercase border-b border-gray-300 pb-1.5 mb-2.5 tracking-wider">
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
              className="w-full text-sm font-bold text-gray-800 bg-white border border-gray-300 p-1 rounded focus:border-blue-500 outline-none"
            />
          ) : (
            <p className="text-sm font-bold text-gray-900">{buyerName}</p>
          )}
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded border border-gray-200">
        <h3 className="text-[11px] font-bold text-gray-800 uppercase border-b border-gray-300 pb-1.5 mb-2.5 tracking-wider">
          Detail Pembayaran
        </h3>

        <div className="space-y-2.5">
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
                className="text-xs font-medium text-gray-800 bg-white border border-gray-300 p-1 rounded focus:border-blue-500 outline-none"
              />
            ) : (
              <p className="text-xs font-medium text-gray-800">{formatDate(date)}</p>
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
                className="text-xs font-medium text-gray-800 bg-white border border-gray-300 p-1 rounded focus:border-blue-500 outline-none w-32"
              >
                {PAYMENT_METHOD_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs font-medium text-gray-800">{paymentMethod}</p>
            )}
          </div>

          {paymentMethod === "Transfer" ? (
            <>
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-gray-500 uppercase font-semibold">
                  Bank
                </label>

                {isEditing ? (
                  <select
                    name="bankName"
                    value={bankName}
                    onChange={(event) => onBankNameChange(event.target.value as BankName)}
                    className="text-xs font-medium text-gray-800 bg-white border border-gray-300 p-1 rounded focus:border-blue-500 outline-none w-32"
                  >
                    {BANK_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs font-medium text-gray-800">{bankName}</p>
                )}
              </div>

              <div className="flex justify-between items-center">
                <label className="text-[10px] text-gray-500 uppercase font-semibold">
                  Nomor Rekening
                </label>

                {isEditing ? (
                  <input
                    type="text"
                    name="accountNumber"
                    value={accountNumber}
                    onChange={(event) => onAccountNumberChange(event.target.value)}
                    className="text-xs font-medium text-gray-800 bg-white border border-gray-300 p-1 rounded focus:border-blue-500 outline-none w-32 text-right"
                  />
                ) : (
                  <p className="text-xs font-medium text-gray-800">{accountNumber}</p>
                )}
              </div>

              <div className="flex justify-between items-center">
                <label className="text-[10px] text-gray-500 uppercase font-semibold">
                  Nama Penerima
                </label>

                {isEditing ? (
                  <input
                    type="text"
                    name="recipientName"
                    value={recipientName}
                    onChange={(event) => onRecipientNameChange(event.target.value)}
                    className="text-xs font-medium text-gray-800 bg-white border border-gray-300 p-1 rounded focus:border-blue-500 outline-none w-32 text-right"
                  />
                ) : (
                  <p className="text-xs font-medium text-gray-800">{recipientName}</p>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
