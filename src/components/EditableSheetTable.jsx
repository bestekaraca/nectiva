import { useState } from "react";

export default function EditableSheetTable({ schema, rows, onUpdateCell, onAddRow, onDeleteRow, searchKey }) {
  const [query, setQuery] = useState("");

  const filtered = query
    ? rows.filter((r) => String(r[searchKey] || "").toLowerCase().includes(query.toLowerCase()))
    : rows;

  return (
    <div>
      {searchKey && (
        <div className="flex items-center justify-between mb-2.5">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Ara...`}
            className="input !w-64 text-xs"
          />
          <span className="text-xs text-ink/35">{filtered.length} / {rows.length} satır</span>
        </div>
      )}
      <div className="overflow-auto border border-mist rounded-lg" style={{ maxHeight: 480 }}>
        <table className="text-xs border-collapse w-full">
          <thead className="sticky top-0 z-10">
            <tr>
              {schema.map((col) => (
                <th
                  key={col.key}
                  style={{ minWidth: col.width }}
                  className="bg-violet-600 text-white font-semibold px-2 py-2 text-left whitespace-nowrap border-r border-violet-500 last:border-r-0"
                >
                  {col.label}
                </th>
              ))}
              <th className="bg-violet-600 w-8 sticky right-0"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={row.id} className={i % 2 === 1 ? "bg-violet-50/40" : "bg-white"}>
                {schema.map((col) => (
                  <td key={col.key} className="border-r border-b border-mist last:border-r-0 p-0">
                    <Cell
                      value={row[col.key]}
                      column={col}
                      onChange={(v) => onUpdateCell(row.id, col.key, v)}
                    />
                  </td>
                ))}
                <td className="border-b border-mist p-0 text-center sticky right-0 bg-inherit">
                  <button
                    onClick={() => onDeleteRow(row.id)}
                    className="text-ink/25 hover:text-rose-500 w-full h-full py-2"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={schema.length + 1} className="text-center text-ink/30 py-6">
                  Kayıt yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button
        onClick={onAddRow}
        className="mt-2.5 text-xs font-medium text-violet-600 hover:text-violet-700"
      >
        + Satır ekle
      </button>
    </div>
  );
}

function Cell({ value, column, onChange }) {
  const [local, setLocal] = useState(value ?? "");

  const commit = () => {
    if (local !== value) onChange(local);
  };

  if (column.type === "select") {
    return (
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1.5 bg-transparent outline-none text-xs cursor-pointer"
        style={{ minWidth: column.width }}
      >
        <option value=""></option>
        {column.options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type={column.type === "number" ? "number" : column.type === "date" ? "date" : "text"}
      value={local ?? ""}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
      className="w-full px-2 py-1.5 bg-transparent outline-none text-xs focus:bg-violet-50"
      style={{ minWidth: column.width }}
    />
  );
}
