import Link from "next/link";
import { getMonthlySummary } from "@/lib/queries/summary";
import { listExpenses } from "@/lib/queries/expenses";
import { centsToDisplay, currentMonth, monthLabel } from "@/lib/utils";
import CategoryPieChart from "@/components/charts/CategoryPieChart";
import CategoryBadge from "@/components/categories/CategoryBadge";

export default async function DashboardPage() {
  const month = currentMonth();
  const summary = getMonthlySummary(month);
  const recentExpenses = listExpenses({ month }).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{monthLabel(month)}</h1>
          <p className="text-gray-500 text-sm">Your spending overview for this month</p>
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
          <CategoryPieChart data={summary.by_category} />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium">Recent expenses</h2>
            <Link href="/expenses" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          {recentExpenses.length === 0 ? (
            <p className="text-sm text-gray-400">No expenses logged yet this month.</p>
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
