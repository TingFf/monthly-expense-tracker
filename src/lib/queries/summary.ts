import { db } from "@/lib/db";
import type { CategoryBreakdownEntry, MonthlySummary, MonthlyTrendEntry } from "@/types";
import { lastNMonths } from "@/lib/utils";

export function getMonthlySummary(month: string): MonthlySummary {
  const rows = db
    .prepare(
      `SELECT
         c.id AS category_id,
         c.name AS category_name,
         c.color AS category_color,
         c.icon AS category_icon,
         SUM(e.amount_cents) AS total_cents
       FROM expenses e
       JOIN categories c ON c.id = e.category_id
       WHERE e.date LIKE ?
       GROUP BY c.id
       ORDER BY total_cents DESC`
    )
    .all(`${month}-%`) as CategoryBreakdownEntry[];

  const total_cents = rows.reduce((sum, row) => sum + row.total_cents, 0);

  return { month, total_cents, by_category: rows };
}

export function getMonthlyTrend(months: number): MonthlyTrendEntry[] {
  const monthList = lastNMonths(months);

  const rows = db
    .prepare(
      `SELECT substr(date, 1, 7) AS month, SUM(amount_cents) AS total_cents
       FROM expenses
       WHERE substr(date, 1, 7) IN (${monthList.map(() => "?").join(",")})
       GROUP BY month`
    )
    .all(...monthList) as MonthlyTrendEntry[];

  const totalsByMonth = new Map(rows.map((row) => [row.month, row.total_cents]));

  return monthList.map((month) => ({
    month,
    total_cents: totalsByMonth.get(month) ?? 0,
  }));
}
