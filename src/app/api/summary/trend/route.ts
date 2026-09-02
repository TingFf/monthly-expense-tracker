import { NextRequest, NextResponse } from "next/server";
import { getMonthlyTrend } from "@/lib/queries/summary";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const months = Number(request.nextUrl.searchParams.get("months") ?? "6");
  return NextResponse.json(getMonthlyTrend(months));
}
