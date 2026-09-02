"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Category } from "@/types";
import CategoryBadge from "@/components/categories/CategoryBadge";
import CategoryForm from "@/components/categories/CategoryForm";

export default function CategoryList({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errorId, setErrorId] = useState<{ id: number; message: string } | null>(null);

  async function handleDelete(category: Category) {
    if (!confirm(`Delete category "${category.name}"?`)) return;

    const res = await fetch(`/api/categories/${category.id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setErrorId({ id: category.id, message: body?.error ?? "Could not delete category" });
      return;
    }
    setErrorId(null);
    router.refresh();
  }

  return (
    <ul className="divide-y divide-gray-100">
      {categories.map((category) => (
        <li key={category.id} className="py-3">
          {editingId === category.id ? (
            <CategoryForm category={category} onDone={() => setEditingId(null)} />
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CategoryBadge name={category.name} color={category.color} icon={category.icon} />
                {category.is_default === 1 && (
                  <span className="text-xs text-gray-400">default</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <button onClick={() => setEditingId(category.id)} className="text-blue-600 hover:underline">
                  Edit
                </button>
                <button onClick={() => handleDelete(category)} className="text-red-600 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          )}
          {errorId?.id === category.id && (
            <p className="text-sm text-red-600 mt-1">{errorId.message}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
