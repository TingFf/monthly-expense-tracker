import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createCategory, getAllCategories } from "@/lib/queries/categories";
import { createCategorySchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getAllCategories());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createCategorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
  }

  try {
    const category = createCategory(parsed.data);
    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json({ error: "A category with that name already exists" }, { status: 409 });
  }
}
