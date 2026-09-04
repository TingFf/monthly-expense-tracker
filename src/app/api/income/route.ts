import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getMonthlyIncome, setMonthlyIncome } from "@/lib/queries/income";
import { setIncomeSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month");

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json(
      { error: "A month query param in YYYY-MM format is required." },
      { status: 400 }
    );
  }

  const income = getMonthlyIncome(month);
  return NextResponse.json(income ?? { month, amount_cents: 0 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const parsed = setIncomeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
  }

  const income = setMonthlyIncome(parsed.data.month, parsed.data.amount_cents);
  return NextResponse.json(income);
}
