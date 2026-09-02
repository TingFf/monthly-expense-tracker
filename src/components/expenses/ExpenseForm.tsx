"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import type { Category, Expense, PaymentMethod } from "@/types";
import { dollarsToCents } from "@/lib/utils";

interface FormValues {
  amount: number;
  category_id: number;
  description: string;
  date: string;
  payment_method: PaymentMethod | "";
}

export default function ExpenseForm({
  categories,
  expense,
}: {
  categories: Category[];
  expense?: Expense;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: expense
      ? {
          amount: expense.amount_cents / 100,
          category_id: expense.category_id,
          description: expense.description ?? "",
          date: expense.date,
          payment_method: expense.payment_method ?? "",
        }
      : {
          amount: undefined,
          category_id: categories[0]?.id,
          description: "",
          date: new Date().toISOString().slice(0, 10),
          payment_method: "",
        },
  });

  async function onSubmit(values: FormValues) {
    setError(null);

    const payload = {
      amount_cents: dollarsToCents(Number(values.amount)),
      category_id: Number(values.category_id),
      description: values.description || null,
      date: values.date,
      payment_method: values.payment_method || null,
    };

    const res = await fetch(expense ? `/api/expenses/${expense.id}` : "/api/expenses", {
      method: expense ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setError("Something went wrong saving this expense. Please check the fields and try again.");
      return;
    }

    router.push("/expenses");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <label className="block text-sm font-medium mb-1">Amount</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          {...register("amount", { required: true, valueAsNumber: true })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          {...register("category_id", { required: true, valueAsNumber: true })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon ? `${category.icon} ` : ""}
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Date</label>
        <input
          type="date"
          {...register("date", { required: true })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description (optional)</label>
        <input
          type="text"
          {...register("description")}
          placeholder="e.g. Weekly groceries"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Payment method (optional)</label>
        <select
          {...register("payment_method")}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">—</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="bank_transfer">Bank transfer</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
        >
          {expense ? "Save changes" : "Add expense"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
