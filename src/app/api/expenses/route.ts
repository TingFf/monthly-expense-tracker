import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createExpense, deleteExpensesByMonth, listExpenses } from "@/lib/queries/expenses";
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

export async function DELETE(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month");

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json(
      { error: "A month query param in YYYY-MM format is required." },
      { status: 400 }
    );
  }

  const deleted_count = deleteExpensesByMonth(month);
  return NextResponse.json({ deleted_count });
}
