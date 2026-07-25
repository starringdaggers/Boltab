"use client";

export default function TimetableGrid({
  columns,
  rows,
}: {
  columns: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-taupe/40 border-collapse min-w-[480px]">
        <thead>
          <tr className="bg-taupe/20">
            {columns.map((col, i) => (
              <th
                key={i}
                className="px-3 py-2 text-left font-medium text-bistre border border-taupe/30"
              >
                {col || <span className="text-vandyke/40 italic">—</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? "bg-white/40" : "bg-white/20"}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2 border border-taupe/20 text-vandyke">
                  {cell || <span className="text-vandyke/30">—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
