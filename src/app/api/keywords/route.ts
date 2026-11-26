import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createKeyword, getAllKeywords } from "@/lib/queries/keywords";
import { createCategoryKeywordSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getAllKeywords());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createCategoryKeywordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
  }

  const result = createKeyword(parsed.data);

  if (result.status === "category_not_found") {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
  if (result.status === "duplicate") {
    return NextResponse.json(
      { error: `"${result.existing.keyword}" is already mapped to ${result.existing.category_name}` },
      { status: 409 }
    );
  }
  return NextResponse.json(result.keyword, { status: 201 });
}
