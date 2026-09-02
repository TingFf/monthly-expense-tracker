import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createExpense, listExpenses } from "@/lib/queries/expenses";
import { createExpenseSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const month = searchParams.get("month") ?? undefined;
  const categoryIdParam = searchParams.get("category");
  const search = searchParams.get("search") ?? undefined;

  const expenses = listExpenses({
    month,
    categoryId: categoryIdParam ? Number(categoryIdParam) : undefined,
    search,
  });

  return NextResponse.json(expenses);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createExpenseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
  }

  const expense = createExpense(parsed.data);
  return NextResponse.json(expense, { status: 201 });
}
