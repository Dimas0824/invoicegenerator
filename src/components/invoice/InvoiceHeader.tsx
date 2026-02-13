type InvoiceHeaderProps = {
  orderId: string;
  isEditing: boolean;
  onOrderIdChange: (value: string) => void;
};

export default function InvoiceHeader({
  orderId,
  isEditing,
  onOrderIdChange,
}: InvoiceHeaderProps) {
  return (
    <div className="text-center mb-6 border-b-2 border-gray-800 pb-4">
      <h1 className="text-3xl font-extrabold uppercase tracking-widest text-slate-800">
        INVOICE
      </h1>
      <p className="text-sm font-bold text-gray-500 tracking-wide mt-1">
        JASA PENGEMBANGAN WEB
      </p>

      <div className="mt-2 text-xs text-gray-500 flex justify-center items-center gap-2">
        <span>Project ID:</span>
        {isEditing ? (
          <input
            type="text"
            name="orderId"
            value={orderId}
            onChange={(event) => onOrderIdChange(event.target.value)}
            className="font-mono font-bold text-gray-800 border-b border-gray-300 focus:border-blue-500 outline-none w-32 text-center bg-blue-50 px-1"
          />
        ) : (
          <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
            {orderId}
          </span>
        )}
      </div>
    </div>
  );
}
