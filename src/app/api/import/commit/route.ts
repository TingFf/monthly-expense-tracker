import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createExpenses, expenseExists } from "@/lib/queries/expenses";
import { importCommitSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = importCommitSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
  }

  const toInsert = parsed.data.items.filter(
    (item) => !expenseExists(item.date, item.amount_cents, item.description ?? null)
  );

  const created = toInsert.length > 0 ? createExpenses(toInsert) : [];

  return NextResponse.json(
    {
      created_count: created.length,
      skipped_duplicate_count: parsed.data.items.length - toInsert.length,
      expenses: created,
    },
    { status: 201 }
  );
}
