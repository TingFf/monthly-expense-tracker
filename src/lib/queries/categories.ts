import { db } from "@/lib/db";
import type { Category } from "@/types";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/lib/validation";

export function getAllCategories(): Category[] {
  return db.prepare("SELECT * FROM categories ORDER BY is_default DESC, name ASC").all() as Category[];
}

export function getCategoryById(id: number): Category | undefined {
  return db.prepare("SELECT * FROM categories WHERE id = ?").get(id) as Category | undefined;
}

export function isCategoryInUse(id: number): boolean {
  const row = db.prepare("SELECT COUNT(*) as count FROM expenses WHERE category_id = ?").get(id) as {
    count: number;
  };
  return row.count > 0;
}

export function createCategory(input: CreateCategoryInput): Category {
  const result = db
    .prepare("INSERT INTO categories (name, color, icon) VALUES (?, ?, ?)")
    .run(input.name, input.color ?? "#64748B", input.icon ?? null);
  return getCategoryById(Number(result.lastInsertRowid))!;
}

export function updateCategory(id: number, input: UpdateCategoryInput): Category | undefined {
  const existing = getCategoryById(id);
  if (!existing) return undefined;

  db.prepare("UPDATE categories SET name = ?, color = ?, icon = ? WHERE id = ?").run(
    input.name ?? existing.name,
    input.color ?? existing.color,
    input.icon !== undefined ? input.icon : existing.icon,
    id
  );
  return getCategoryById(id);
}

export type DeleteCategoryResult = "deleted" | "not_found" | "in_use";

export function deleteCategory(id: number): DeleteCategoryResult {
  const existing = getCategoryById(id);
  if (!existing) return "not_found";
  if (isCategoryInUse(id)) return "in_use";

  db.prepare("DELETE FROM categories WHERE id = ?").run(id);
  return "deleted";
}
