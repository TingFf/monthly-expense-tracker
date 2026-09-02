import { NextRequest, NextResponse } from "next/server";
import { getMonthlySummary } from "@/lib/queries/summary";
import { currentMonth } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month") ?? currentMonth();
  return NextResponse.json(getMonthlySummary(month));
}
