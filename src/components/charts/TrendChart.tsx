"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyTrendEntry } from "@/types";
import { centsToDisplay, monthLabel } from "@/lib/utils";

export default function TrendChart({ data }: { data: MonthlyTrendEntry[] }) {
  const chartData = data.map((entry) => ({
    month: monthLabel(entry.month).replace(/ \d{4}$/, ""),
    total: entry.total_cents / 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip formatter={(value) => `$${centsToDisplay(Number(value) * 100)}`} />
        <Bar dataKey="total" fill="#3B82F6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
