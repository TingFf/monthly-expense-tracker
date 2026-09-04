import { db } from "@/lib/db";
import type { MonthlyIncome } from "@/types";

export function getMonthlyIncome(month: string): MonthlyIncome | null {
  const row = db
    .prepare(`SELECT * FROM monthly_income WHERE month = ?`)
    .get(month) as MonthlyIncome | undefined;

  return row ?? null;
}

export function setMonthlyIncome(month: string, amount_cents: number): MonthlyIncome {
  db.prepare(
    `INSERT INTO monthly_income (month, amount_cents)
     VALUES (?, ?)
     ON CONFLICT(month) DO UPDATE SET
       amount_cents = excluded.amount_cents,
       updated_at = datetime('now')`
  ).run(month, amount_cents);

  return getMonthlyIncome(month)!;
}
