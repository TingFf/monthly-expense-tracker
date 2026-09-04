"use client";

import { useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
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

  const selected = data.find((c) => c.category_id === selectedCategoryId);
  const categoryExpenses = selected
    ? expenses.filter((e) => e.category_id === selected.category_id)
    : [];

  return (
    <div>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label={(entry) => `$${centsToDisplay(entry.value as number)}`}
            onClick={(_, index) =>
              setSelectedCategoryId((current) =>
                current === chartData[index].id ? null : chartData[index].id
              )
            }
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
          <Legend
            onClick={(_, index) =>
              setSelectedCategoryId((current) =>
                current === chartData[index].id ? null : chartData[index].id
              )
            }
            wrapperStyle={{ cursor: "pointer" }}
          />
        </PieChart>
      </ResponsiveContainer>

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
