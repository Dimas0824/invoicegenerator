type InvoiceFooterProps = {
  location: string;
  date: string;
  sellerName: string;
  isEditing: boolean;
  formatDate: (value: string) => string;
  onLocationChange: (value: string) => void;
};

export default function InvoiceFooter({
  location,
  date,
  sellerName,
  isEditing,
  formatDate,
  onLocationChange,
}: InvoiceFooterProps) {
  return (
    <div className="flex justify-between items-end mt-auto">
      <div className="text-xs text-gray-500 w-1/2"></div>

      <div className="text-center w-48 text-sm">
        <div className="mb-4 text-gray-600 text-xs">
          {isEditing ? (
            <input
              name="location"
              value={location}
              onChange={(event) => onLocationChange(event.target.value)}
              className="text-right w-24 border-b border-dashed border-gray-300 outline-none"
            />
          ) : (
            location
          )}
          , {formatDate(date)}
        </div>

        <div className="font-bold text-gray-800 mb-1">{sellerName}</div>

        <div className="h-20 w-full flex items-end justify-center">
          <div className="border-b border-gray-300 w-32"></div>
        </div>

        <div className="font-medium text-gray-500 text-[10px] mt-1">
          ( Authorized Signature )
        </div>
      </div>
    </div>
  );
}
