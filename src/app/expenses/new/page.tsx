import { getAllCategories } from "@/lib/queries/categories";
import ExpenseForm from "@/components/expenses/ExpenseForm";

export const dynamic = "force-dynamic";

export default async function NewExpensePage() {
  const categories = getAllCategories();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Add Expense</h1>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <ExpenseForm categories={categories} />
      </div>
    </div>
  );
}
