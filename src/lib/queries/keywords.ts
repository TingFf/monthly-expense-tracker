import { db } from "@/lib/db";
import type { CategoryKeywordWithCategory } from "@/types";
import type { CreateCategoryKeywordInput } from "@/lib/validation";

const SELECT_WITH_CATEGORY = `
  SELECT k.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
  FROM category_keywords k
  JOIN categories c ON c.id = k.category_id
`;

export function getAllKeywords(): CategoryKeywordWithCategory[] {
  return db
    .prepare(`${SELECT_WITH_CATEGORY} ORDER BY c.name ASC, k.keyword COLLATE NOCASE ASC`)
    .all() as CategoryKeywordWithCategory[];
}

export function getKeywordById(id: number): CategoryKeywordWithCategory | undefined {
  return db.prepare(`${SELECT_WITH_CATEGORY} WHERE k.id = ?`).get(id) as
    | CategoryKeywordWithCategory
    | undefined;
}

export type CreateKeywordResult =
  | { status: "created"; keyword: CategoryKeywordWithCategory }
  | { status: "duplicate"; existing: CategoryKeywordWithCategory }
  | { status: "category_not_found" };

export function createKeyword(input: CreateCategoryKeywordInput): CreateKeywordResult {
  const category = db.prepare("SELECT id FROM categories WHERE id = ?").get(input.category_id);
  if (!category) return { status: "category_not_found" };

  // keyword column is COLLATE NOCASE, so this lookup is case-insensitive.
  const existing = db
    .prepare(`${SELECT_WITH_CATEGORY} WHERE k.keyword = ?`)
    .get(input.keyword) as CategoryKeywordWithCategory | undefined;
  if (existing) return { status: "duplicate", existing };

  const result = db
    .prepare("INSERT INTO category_keywords (keyword, category_id) VALUES (?, ?)")
    .run(input.keyword, input.category_id);
  return { status: "created", keyword: getKeywordById(Number(result.lastInsertRowid))! };
}

export function deleteKeyword(id: number): boolean {
  return db.prepare("DELETE FROM category_keywords WHERE id = ?").run(id).changes > 0;
}
