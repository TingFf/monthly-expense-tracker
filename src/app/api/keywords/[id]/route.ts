import { NextRequest, NextResponse } from "next/server";
import { deleteKeyword } from "@/lib/queries/keywords";

export const runtime = "nodejs";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!deleteKeyword(Number(id))) {
    return NextResponse.json({ error: "Keyword not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
