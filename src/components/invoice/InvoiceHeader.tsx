type InvoiceHeaderProps = {
  orderId: string;
  tagline: string;
  isEditing: boolean;
  onOrderIdChange: (value: string) => void;
  onTaglineChange: (value: string) => void;
};

export default function InvoiceHeader({
  orderId,
  tagline,
  isEditing,
  onOrderIdChange,
  onTaglineChange,
}: InvoiceHeaderProps) {
  return (
    <div className="text-center mb-6 border-b-2 border-gray-800 pb-4">
      <h1 className="text-3xl font-extrabold uppercase tracking-widest text-slate-800">
        INVOICE
      </h1>
      {isEditing ? (
        <input
          type="text"
          name="invoiceTagline"
          value={tagline}
          onChange={(event) => onTaglineChange(event.target.value)}
          className="text-sm font-bold text-gray-500 tracking-wide mt-1 text-center border-b border-dashed border-gray-300 focus:border-blue-500 outline-none w-72 max-w-full uppercase"
        />
      ) : (
        <p className="text-sm font-bold text-gray-500 tracking-wide mt-1">{tagline}</p>
      )}

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
