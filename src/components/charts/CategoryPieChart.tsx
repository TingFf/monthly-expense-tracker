"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CategoryBreakdownEntry } from "@/types";
import { centsToDisplay } from "@/lib/utils";

export default function CategoryPieChart({ data }: { data: CategoryBreakdownEntry[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-gray-400">
        No expenses yet this month
      </div>
    );
  }

  const chartData = data.map((entry) => ({
    name: entry.category_name,
    value: entry.total_cents,
    color: entry.category_color,
  }));

  return (
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
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `$${centsToDisplay(Number(value))}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
