import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deleteCategory, updateCategory } from "@/lib/queries/categories";
import { updateCategorySchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateCategorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
  }

  const category = updateCategory(Number(id), parsed.data);
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
  return NextResponse.json(category);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = deleteCategory(Number(id));

  if (result === "not_found") {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
  if (result === "in_use") {
    return NextResponse.json(
      { error: "Category is in use by existing expenses and cannot be deleted" },
      { status: 409 }
    );
  }
  return new NextResponse(null, { status: 204 });
}
