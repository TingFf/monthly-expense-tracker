export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string | null;
  is_default: 0 | 1;
  created_at: string;
}

export type PaymentMethod = "cash" | "card" | "bank_transfer" | "other";

export interface Expense {
  id: number;
  amount_cents: number;
  category_id: number;
  description: string | null;
  date: string; // ISO 'YYYY-MM-DD'
  payment_method: PaymentMethod | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseWithCategory extends Expense {
  category_name: string;
  category_color: string;
  category_icon: string | null;
}

export interface ExpenseFilters {
  month?: string; // 'YYYY-MM'
  categoryId?: number;
  search?: string;
}

export interface CategoryBreakdownEntry {
  category_id: number;
  category_name: string;
  category_color: string;
  category_icon: string | null;
  total_cents: number;
}

export interface MonthlySummary {
  month: string; // 'YYYY-MM'
  total_cents: number;
  by_category: CategoryBreakdownEntry[];
}

export interface MonthlyTrendEntry {
  month: string; // 'YYYY-MM'
  total_cents: number;
}
