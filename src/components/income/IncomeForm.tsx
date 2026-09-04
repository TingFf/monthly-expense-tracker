"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { centsToDisplay, dollarsToCents } from "@/lib/utils";

export default function IncomeForm({
  month,
  amountCents,
}: {
  month: string;
  amountCents: number;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(amountCents > 0 ? (amountCents / 100).toString() : "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const dollars = Number(value);
    if (!Number.isFinite(dollars) || dollars < 0) {
      setError("Enter a valid amount");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/income", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, amount_cents: dollarsToCents(dollars) }),
    });
    setSubmitting(false);

    if (!res.ok) {
      setError("Could not save salary");
      return;
    }

    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-xs text-blue-600 hover:underline"
      >
        {amountCents > 0 ? `Edit salary ($${centsToDisplay(amountCents)})` : "Set salary for this month"}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="number"
        step="0.01"
        min="0"
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Salary"
        className="border border-gray-300 rounded-md px-2 py-1 text-sm w-28"
      />
      <button
        type="submit"
        disabled={submitting}
        className="px-2 py-1 rounded-md bg-gray-900 text-white text-xs font-medium hover:bg-gray-700 disabled:opacity-50"
      >
        Save
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="text-xs text-gray-500 hover:underline"
      >
        Cancel
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}
