"use client";

import type { Category } from "@/types";
import type { ImportPreviewMeta, ParsedTransaction } from "@/lib/import/types";
import { centsToDisplay } from "@/lib/utils";

export default function ImportPreviewTable({
  meta,
  rows,
  categories,
  onChange,
  onSelectAll,
}: {
  meta: ImportPreviewMeta;
  rows: ParsedTransaction[];
  categories: Category[];
  onChange: (row_index: number, patch: Partial<Pick<ParsedTransaction, "include" | "suggested_category_id">>) => void;
  onSelectAll: (include: boolean) => void;
}) {
  const duplicateCount = rows.filter((r) => r.is_duplicate).length;

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        {meta.source_filename} — {rows.length} expense{rows.length === 1 ? "" : "s"} found
        {meta.credit_rows_skipped > 0 && `, ${meta.credit_rows_skipped} incoming credit(s) skipped`}
        {meta.unparsed_lines_skipped > 0 && `, ${meta.unparsed_lines_skipped} line(s) couldn't be read`}
        {duplicateCount > 0 && `, ${duplicateCount} possible duplicate(s) unchecked below`}.
      </p>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">No expenses found in this file.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="py-2 pr-4">
                  <input
                    type="checkbox"
                    checked={rows.every((r) => r.include)}
                    onChange={(e) => onSelectAll(e.target.checked)}
                  />
                </th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Description</th>
                <th className="py-2 pr-4 text-right">Amount</th>
                <th className="py-2 pr-4">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => (
                <tr key={row.row_index} className={row.is_duplicate ? "bg-amber-50" : undefined}>
                  <td className="py-2 pr-4">
                    <input
                      type="checkbox"
                      checked={row.include}
                      onChange={(e) => onChange(row.row_index, { include: e.target.checked })}
                    />
                  </td>
                  <td className="py-2 pr-4 whitespace-nowrap">{row.date}</td>
                  <td className="py-2 pr-4 text-gray-600">
                    {row.description}
                    {row.is_duplicate && (
                      <span className="ml-2 text-xs text-amber-700 bg-amber-100 rounded px-1.5 py-0.5">
                        Duplicate
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-4 text-right font-medium whitespace-nowrap">
                    ${centsToDisplay(row.amount_cents)}
                  </td>
                  <td className="py-2 pr-4">
                    <select
                      value={row.suggested_category_id}
                      onChange={(e) => onChange(row.row_index, { suggested_category_id: Number(e.target.value) })}
                      className="border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.icon ? `${category.icon} ` : ""}
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
