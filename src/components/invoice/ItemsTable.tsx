import { Plus, Trash2 } from "lucide-react";

import type { InvoiceItem, InvoiceItemChangeHandler } from "./types";

type ItemsTableProps = {
  items: InvoiceItem[];
  isEditing: boolean;
  formatCurrency: (value: number) => string;
  onItemChange: InvoiceItemChangeHandler;
  onAddItem: () => void;
  onRemoveItem: (id: number) => void;
};

export default function ItemsTable({
  items,
  isEditing,
  formatCurrency,
  onItemChange,
  onAddItem,
  onRemoveItem,
}: ItemsTableProps) {
  return (
    <div className="mb-8">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-800 text-white">
            <th className="py-2 px-2 text-center text-[10px] uppercase font-bold w-12 rounded-tl-md">
              No
            </th>
            <th className="py-2 px-4 text-left text-[10px] uppercase font-bold">
              Deskripsi Pekerjaan
            </th>
            <th className="py-2 px-2 text-center text-[10px] uppercase font-bold w-16">
              Qty
            </th>
            <th className="py-2 px-2 text-right text-[10px] uppercase font-bold w-32">
              Harga Satuan
            </th>
            <th className="py-2 px-4 text-right text-[10px] uppercase font-bold w-32 rounded-tr-md">
              Total
            </th>
            <th className="py-2 w-8 print:hidden bg-slate-800"></th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => (
            <tr
              key={item.id}
              className="border-b border-gray-200 align-top text-sm hover:bg-gray-50"
            >
              <td className="py-3 px-2 text-center text-gray-500 font-medium">
                {index + 1}
              </td>

              <td className="py-3 px-4">
                {isEditing ? (
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(event) =>
                        onItemChange(item.id, "title", event.target.value)
                      }
                      className="font-bold text-gray-800 w-full outline-none border-b border-dashed border-gray-300 focus:border-blue-500 bg-transparent"
                      placeholder="Judul Jasa"
                    />

                    <textarea
                      value={item.details}
                      onChange={(event) =>
                        onItemChange(item.id, "details", event.target.value)
                      }
                      className="text-xs text-gray-600 w-full outline-none border border-dashed border-gray-300 p-1 rounded resize-none focus:border-blue-500 bg-transparent"
                      rows={2}
                      placeholder="Detail..."
                    />
                  </div>
                ) : (
                  <div>
                    <p className="font-bold text-gray-800">{item.title}</p>
                    {item.details ? (
                      <p className="text-xs text-gray-500 whitespace-pre-line mt-1">
                        {item.details}
                      </p>
                    ) : null}
                  </div>
                )}
              </td>

              <td className="py-3 px-2 text-center">
                {isEditing ? (
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(event) =>
                      onItemChange(
                        item.id,
                        "quantity",
                        Number.parseInt(event.target.value, 10) || 0,
                      )
                    }
                    className="w-12 text-center outline-none border border-gray-300 rounded focus:border-blue-500 p-1"
                  />
                ) : (
                  item.quantity
                )}
              </td>

              <td className="py-3 px-2 text-right text-gray-600 whitespace-nowrap">
                {isEditing ? (
                  <input
                    type="number"
                    value={item.price}
                    onChange={(event) =>
                      onItemChange(
                        item.id,
                        "price",
                        Number.parseInt(event.target.value, 10) || 0,
                      )
                    }
                    className="w-24 text-right outline-none border border-gray-300 rounded focus:border-blue-500 p-1"
                  />
                ) : (
                  formatCurrency(item.price)
                )}
              </td>

              <td className="py-3 px-4 text-right font-bold text-gray-900 whitespace-nowrap">
                {formatCurrency(item.quantity * item.price)}
              </td>

              <td className="py-3 text-center align-middle print:hidden">
                {isEditing ? (
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isEditing ? (
        <button
          onClick={onAddItem}
          className="mt-3 flex items-center gap-2 text-xs text-white bg-blue-600 px-3 py-2 rounded hover:bg-blue-700 print:hidden shadow-sm"
        >
          <Plus size={14} /> Tambah Baris Baru
        </button>
      ) : null}
    </div>
  );
}
