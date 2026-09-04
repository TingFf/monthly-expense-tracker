"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CategoryBreakdownEntry, ExpenseWithCategory } from "@/types";
import { centsToDisplay } from "@/lib/utils";
import CategoryBadge from "@/components/categories/CategoryBadge";

export default function CategoryPieChart({
  data,
  expenses,
}: {
  data: CategoryBreakdownEntry[];
  expenses: ExpenseWithCategory[];
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-gray-400">
        No expenses yet this month
      </div>
    );
  }

  const chartData = data.map((entry) => ({
    id: entry.category_id,
    name: entry.category_name,
    value: entry.total_cents,
    color: entry.category_color,
  }));

  function toggleCategory(id: number) {
    setSelectedCategoryId((current) => (current === id ? null : id));
  }

  const selected = data.find((c) => c.category_id === selectedCategoryId);
  const categoryExpenses = selected
    ? expenses.filter((e) => e.category_id === selected.category_id)
    : [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
        <div className="w-full sm:flex-1 sm:min-w-0">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                onClick={(_, index) => toggleCategory(chartData[index].id)}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.id}
                    fill={entry.color}
                    stroke={entry.id === selectedCategoryId ? "#111827" : "#ffffff"}
                    strokeWidth={entry.id === selectedCategoryId ? 2 : 1}
                    style={{ cursor: "pointer" }}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${centsToDisplay(Number(value))}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="w-full sm:w-52 sm:shrink-0 space-y-1">
          {chartData.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => toggleCategory(entry.id)}
                className={`w-full flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-left hover:bg-gray-50 ${
                  entry.id === selectedCategoryId ? "bg-gray-100" : ""
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="truncate text-gray-700">{entry.name}</span>
                </span>
                <span className="font-medium shrink-0">${centsToDisplay(entry.value)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {selected && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CategoryBadge
                name={selected.category_name}
                color={selected.category_color}
                icon={selected.category_icon}
              />
              <span className="text-sm text-gray-500">
                {categoryExpenses.length} expense{categoryExpenses.length === 1 ? "" : "s"} · $
                {centsToDisplay(selected.total_cents)}
              </span>
            </div>
            <button
              onClick={() => setSelectedCategoryId(null)}
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              Clear
            </button>
          </div>
          {categoryExpenses.length === 0 ? (
            <p className="text-sm text-gray-400">No expenses found for this category.</p>
          ) : (
            <ul className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
              {categoryExpenses.map((expense) => (
                <li key={expense.id} className="py-2 flex items-center justify-between text-sm">
                  <div>
                    <p className="text-gray-700">{expense.description || "—"}</p>
                    <p className="text-xs text-gray-400">{expense.date}</p>
                  </div>
                  <span className="font-medium">${centsToDisplay(expense.amount_cents)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
