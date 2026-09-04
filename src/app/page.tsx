import Link from "next/link";
import { getMonthlySummary } from "@/lib/queries/summary";
import { listExpenses } from "@/lib/queries/expenses";
import { centsToDisplay, currentMonth, monthLabel, shiftMonth } from "@/lib/utils";
import CategoryPieChart from "@/components/charts/CategoryPieChart";
import CategoryBadge from "@/components/categories/CategoryBadge";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const today = currentMonth();
  const month = params.month ?? today;
  const isCurrentMonth = month === today;
  const summary = getMonthlySummary(month);
  const monthExpenses = listExpenses({ month });
  const recentExpenses = monthExpenses.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={`/?month=${shiftMonth(month, -1)}`}
              className="px-2 py-1 rounded-md text-gray-500 hover:bg-gray-100"
              aria-label="Previous month"
            >
              ←
            </Link>
            <h1 className="text-2xl font-semibold">{monthLabel(month)}</h1>
            {!isCurrentMonth && (
              <Link
                href={`/?month=${shiftMonth(month, 1)}`}
                className="px-2 py-1 rounded-md text-gray-500 hover:bg-gray-100"
                aria-label="Next month"
              >
                →
              </Link>
            )}
          </div>
          <p className="text-gray-500 text-sm">
            {isCurrentMonth ? (
              "Your spending overview for this month"
            ) : (
              <>
                Your spending overview for this month —{" "}
                <Link href="/" className="text-blue-600 hover:underline">
                  back to current month
                </Link>
              </>
            )}
          </p>
        </div>
        <Link
          href="/expenses/new"
          className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-700"
        >
          + Add Expense
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">Total spent this month</p>
        <p className="text-3xl font-semibold mt-1">${centsToDisplay(summary.total_cents)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-medium mb-2">By category</h2>
          <p className="text-xs text-gray-400 mb-2">Click a category to see its expenses</p>
          <CategoryPieChart data={summary.by_category} expenses={monthExpenses} />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium">Recent expenses</h2>
            <Link href={`/expenses?month=${month}`} className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          {recentExpenses.length === 0 ? (
            <p className="text-sm text-gray-400">
              No expenses logged {isCurrentMonth ? "yet this month" : `for ${monthLabel(month)}`}.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentExpenses.map((expense) => (
                <li key={expense.id} className="py-2 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <CategoryBadge
                      name={expense.category_name}
                      color={expense.category_color}
                      icon={expense.category_icon}
                    />
                    <span className="text-gray-500">{expense.description || "—"}</span>
                  </div>
                  <span className="font-medium">${centsToDisplay(expense.amount_cents)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
