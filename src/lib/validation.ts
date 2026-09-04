import { z } from "zod";

export const paymentMethodSchema = z.enum(["cash", "card", "bank_transfer", "other"]);

export const createExpenseSchema = z.object({
  amount_cents: z.number().int().positive(),
  category_id: z.number().int().positive(),
  description: z.string().trim().max(500).optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  payment_method: paymentMethodSchema.optional().nullable(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(50),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a hex code like #64748B")
    .optional(),
  icon: z.string().trim().max(10).optional().nullable(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const setIncomeSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"),
  amount_cents: z.number().int().nonnegative(),
});

export const importCommitSchema = z.object({
  items: z.array(createExpenseSchema).min(1).max(1000),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ImportCommitInput = z.infer<typeof importCommitSchema>;
export type SetIncomeInput = z.infer<typeof setIncomeSchema>;
