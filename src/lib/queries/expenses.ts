import { db } from "@/lib/db";
import type { Expense, ExpenseFilters, ExpenseWithCategory } from "@/types";
import type { CreateExpenseInput, UpdateExpenseInput } from "@/lib/validation";

const SELECT_WITH_CATEGORY = `
  SELECT
    e.*,
    c.name AS category_name,
    c.color AS category_color,
    c.icon AS category_icon
  FROM expenses e
  JOIN categories c ON c.id = e.category_id
`;

export function listExpenses(filters: ExpenseFilters = {}): ExpenseWithCategory[] {
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  if (filters.month) {
    clauses.push("e.date LIKE ?");
    params.push(`${filters.month}-%`);
  }
  if (filters.categoryId) {
    clauses.push("e.category_id = ?");
    params.push(filters.categoryId);
  }
  if (filters.search) {
    clauses.push("e.description LIKE ?");
    params.push(`%${filters.search}%`);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const sql = `${SELECT_WITH_CATEGORY} ${where} ORDER BY e.date DESC, e.id DESC`;

  return db.prepare(sql).all(...params) as ExpenseWithCategory[];
}

export function getExpenseById(id: number): ExpenseWithCategory | undefined {
  return db.prepare(`${SELECT_WITH_CATEGORY} WHERE e.id = ?`).get(id) as
    | ExpenseWithCategory
    | undefined;
}

export function createExpense(input: CreateExpenseInput): Expense {
  const result = db
    .prepare(
      `INSERT INTO expenses (amount_cents, category_id, description, date, payment_method)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(
      input.amount_cents,
      input.category_id,
      input.description ?? null,
      input.date,
      input.payment_method ?? null
    );

  return db.prepare("SELECT * FROM expenses WHERE id = ?").get(result.lastInsertRowid) as Expense;
}

export function updateExpense(id: number, input: UpdateExpenseInput): Expense | undefined {
  const existing = db.prepare("SELECT * FROM expenses WHERE id = ?").get(id) as Expense | undefined;
  if (!existing) return undefined;

  db.prepare(
    `UPDATE expenses
     SET amount_cents = ?, category_id = ?, description = ?, date = ?, payment_method = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(
    input.amount_cents ?? existing.amount_cents,
    input.category_id ?? existing.category_id,
    input.description !== undefined ? input.description : existing.description,
    input.date ?? existing.date,
    input.payment_method !== undefined ? input.payment_method : existing.payment_method,
    id
  );

  return db.prepare("SELECT * FROM expenses WHERE id = ?").get(id) as Expense;
}

export function deleteExpense(id: number): boolean {
  const result = db.prepare("DELETE FROM expenses WHERE id = ?").run(id);
  return result.changes > 0;
}
