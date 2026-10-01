"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CategoryTrendPoint, CategoryWithColor } from "@/lib/queries/summary";
import { centsToDisplay, monthLabel } from "@/lib/utils";

interface CategoryTrendChartProps {
  data: CategoryTrendPoint[];
  categories: CategoryWithColor[];
}

export default function CategoryTrendChart({
  data,
  categories,
}: CategoryTrendChartProps) {
  const chartData = data.map((entry) => ({
    month: monthLabel(entry.month).replace(/ \d{4}$/, ""),
    ...Object.fromEntries(
      Object.entries(entry).filter(([key]) => key !== "month")
    ),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value) => `$${centsToDisplay(Number(value) * 100)}`}
        />
        <Legend wrapperStyle={{ paddingTop: "20px" }} />
        {categories.map((category) => (
          <Line
            key={category.name}
            type="monotone"
            dataKey={category.name}
            stroke={category.color}
            strokeWidth={2}
            dot={{ fill: category.color, r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
