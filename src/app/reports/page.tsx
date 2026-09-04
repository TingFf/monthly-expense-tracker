import Link from "next/link";
import { getMonthlySummary, getMonthlyTrend } from "@/lib/queries/summary";
import { listExpenses } from "@/lib/queries/expenses";
import { centsToDisplay, currentMonth, monthLabel, shiftMonth } from "@/lib/utils";
import CategoryPieChart from "@/components/charts/CategoryPieChart";
import TrendChart from "@/components/charts/TrendChart";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const month = params.month ?? currentMonth();
  const summary = getMonthlySummary(month);
  const monthExpenses = listExpenses({ month });
  const trend = getMonthlyTrend(6);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <div className="flex items-center gap-3 text-sm">
          <Link href={`/reports?month=${shiftMonth(month, -1)}`} className="text-gray-500 hover:text-gray-900">
            ← Prev
          </Link>
          <span className="font-medium">{monthLabel(month)}</span>
          <Link href={`/reports?month=${shiftMonth(month, 1)}`} className="text-gray-500 hover:text-gray-900">
            Next →
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">Total spent</p>
        <p className="text-3xl font-semibold mt-1">${centsToDisplay(summary.total_cents)}</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-medium mb-2">Category breakdown</h2>
        <p className="text-xs text-gray-400 mb-2">Click a category to see its expenses</p>
        <CategoryPieChart data={summary.by_category} expenses={monthExpenses} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-medium mb-2">Last 6 months</h2>
        <TrendChart data={trend} />
      </div>
    </div>
  );
}
