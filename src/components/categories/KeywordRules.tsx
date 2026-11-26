"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Category, CategoryKeywordWithCategory } from "@/types";
import CategoryBadge from "@/components/categories/CategoryBadge";

export default function KeywordRules({
  categories,
  keywords,
}: {
  categories: Category[];
  keywords: CategoryKeywordWithCategory[];
}) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword, category_id: categoryId }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error?.properties?.keyword?.errors?.[0] ?? (typeof body?.error === "string" ? body.error : "Could not save keyword"));
      return;
    }

    setKeyword("");
    router.refresh();
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/keywords/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Could not remove keyword");
      return;
    }
    setError(null);
    router.refresh();
  }

  const grouped = categories
    .map((category) => ({ category, items: keywords.filter((k) => k.category_id === category.id) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-medium text-sm text-gray-600">Import keyword rules</h2>
        <p className="text-xs text-gray-400 mt-1">
          When importing a bank statement, any transaction whose description contains a keyword
          (case-insensitive) is automatically assigned to its category. These take priority over the
          built-in merchant list; if several match, the longest keyword wins.
        </p>
      </div>

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Keyword</label>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            required
            maxLength={100}
            placeholder="e.g. SHOPEE"
            className="border border-gray-300 rounded-md px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-2 py-1.5 text-sm"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon ? `${category.icon} ` : ""}
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={submitting || categories.length === 0}
          className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
        >
          Add keyword
        </button>
        {error && <p className="text-sm text-red-600 w-full">{error}</p>}
      </form>

      {grouped.length === 0 ? (
        <p className="text-sm text-gray-400">No keyword rules yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {grouped.map(({ category, items }) => (
            <li key={category.id} className="py-3 flex flex-wrap items-center gap-2">
              <CategoryBadge name={category.name} color={category.color} icon={category.icon} />
              <span className="text-gray-300">←</span>
              {items.map((k) => (
                <span
                  key={k.id}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700"
                >
                  {k.keyword}
                  <button
                    onClick={() => handleDelete(k.id)}
                    aria-label={`Remove keyword ${k.keyword}`}
                    className="text-gray-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
