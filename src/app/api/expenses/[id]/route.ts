import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deleteExpense, getExpenseById, updateExpense } from "@/lib/queries/expenses";
import { updateExpenseSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const expense = getExpenseById(Number(id));

  if (!expense) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }
  return NextResponse.json(expense);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateExpenseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
  }

  const expense = updateExpense(Number(id), parsed.data);
  if (!expense) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }
  return NextResponse.json(expense);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deleted = deleteExpense(Number(id));

  if (!deleted) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
