"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ExpenseWithCategory } from "@/types";
import { centsToDisplay } from "@/lib/utils";
import CategoryBadge from "@/components/categories/CategoryBadge";

export default function ExpenseTable({ expenses }: { expenses: ExpenseWithCategory[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDelete(id: number) {
    if (!confirm("Delete this expense?")) return;
    setDeletingId(id);
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    setDeletingId(null);
    router.refresh();
  }

  if (expenses.length === 0) {
    return <p className="text-sm text-gray-400 py-8 text-center">No expenses match these filters.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-200">
            <th className="py-2 pr-4">Date</th>
            <th className="py-2 pr-4">Category</th>
            <th className="py-2 pr-4">Description</th>
            <th className="py-2 pr-4 text-right">Amount</th>
            <th className="py-2 pr-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td className="py-2 pr-4 whitespace-nowrap">{expense.date}</td>
              <td className="py-2 pr-4">
                <CategoryBadge
                  name={expense.category_name}
                  color={expense.category_color}
                  icon={expense.category_icon}
                />
              </td>
              <td className="py-2 pr-4 text-gray-600">{expense.description || "—"}</td>
              <td className="py-2 pr-4 text-right font-medium">
                ${centsToDisplay(expense.amount_cents)}
              </td>
              <td className="py-2 pr-4 text-right whitespace-nowrap">
                <Link
                  href={`/expenses/${expense.id}/edit`}
                  className="text-blue-600 hover:underline mr-3"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(expense.id)}
                  disabled={deletingId === expense.id}
                  className="text-red-600 hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
