import { notFound } from "next/navigation";
import { getAllCategories } from "@/lib/queries/categories";
import { getExpenseById } from "@/lib/queries/expenses";
import ExpenseForm from "@/components/expenses/ExpenseForm";

export const dynamic = "force-dynamic";

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const expense = getExpenseById(Number(id));
  if (!expense) notFound();

  const categories = getAllCategories();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit Expense</h1>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <ExpenseForm categories={categories} expense={expense} />
      </div>
    </div>
  );
}
