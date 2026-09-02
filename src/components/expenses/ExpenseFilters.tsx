"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Category } from "@/types";

export default function ExpenseFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/expenses?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div>
        <label className="block text-xs text-gray-500 mb-1">Month</label>
        <input
          type="month"
          defaultValue={searchParams.get("month") ?? ""}
          onChange={(e) => updateParam("month", e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Category</label>
        <select
          defaultValue={searchParams.get("category") ?? ""}
          onChange={(e) => updateParam("category", e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-1.5 text-sm min-w-32"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 min-w-40">
        <label className="block text-xs text-gray-500 mb-1">Search description</label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") updateParam("search", search);
          }}
          onBlur={() => updateParam("search", search)}
          placeholder="e.g. groceries"
          className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
        />
      </div>
      {(searchParams.get("month") || searchParams.get("category") || searchParams.get("search")) && (
        <button
          onClick={() => {
            setSearch("");
            router.push("/expenses");
          }}
          className="text-sm text-gray-500 hover:text-gray-900 underline px-2 py-1.5"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
