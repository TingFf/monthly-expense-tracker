import Link from "next/link";
import { Suspense } from "react";
import { listExpenses } from "@/lib/queries/expenses";
import { getAllCategories } from "@/lib/queries/categories";
import ExpenseFilters from "@/components/expenses/ExpenseFilters";
import ExpenseTable from "@/components/expenses/ExpenseTable";

export const dynamic = "force-dynamic";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; category?: string; search?: string }>;
}) {
  const params = await searchParams;
  const categories = getAllCategories();
  const expenses = listExpenses({
    month: params.month,
    categoryId: params.category ? Number(params.category) : undefined,
    search: params.search,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Expenses</h1>
        <Link
          href="/expenses/new"
          className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-700"
        >
          + Add Expense
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <Suspense>
          <ExpenseFilters categories={categories} />
        </Suspense>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <ExpenseTable expenses={expenses} />
      </div>
    </div>
  );
}
