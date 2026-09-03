import { NextRequest, NextResponse } from "next/server";
import { getAllCategories } from "@/lib/queries/categories";
import { expenseExists } from "@/lib/queries/expenses";
import { parseCsvStatement } from "@/lib/import/csvParser";
import { parsePdfStatement } from "@/lib/import/pdfParser";
import { categorizeDescription } from "@/lib/import/merchantRules";
import { ImportParseError } from "@/lib/import/types";
import type { ImportPreviewMeta, ImportPreviewResponse, ParsedTransaction, RawTransaction } from "@/lib/import/types";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large (max 10MB)." }, { status: 400 });
  }

  const isCsv = file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv");
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isCsv && !isPdf) {
    return NextResponse.json(
      { error: "Unsupported file type. Upload a CSV or PDF bank statement." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let raw: { transactions: RawTransaction[]; totalRowsDetected: number; unparsedLinesSkipped: number };

  try {
    if (isCsv) {
      const result = parseCsvStatement(buffer.toString("utf-8"));
      raw = { ...result, unparsedLinesSkipped: 0 };
    } else {
      raw = await parsePdfStatement(buffer);
    }
  } catch (err) {
    const message = err instanceof ImportParseError ? err.message : "Could not parse this file.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  const debitRows = raw.transactions.filter((t) => t.direction === "debit");
  const categories = getAllCategories();

  const transactions: ParsedTransaction[] = debitRows.map((t, row_index) => {
    const { categoryId, categoryName } = categorizeDescription(t.description, categories);
    const duplicate = expenseExists(t.date, t.amount_cents, t.description);
    return {
      row_index,
      date: t.date,
      description: t.description,
      amount_cents: t.amount_cents,
      suggested_category_id: categoryId,
      suggested_category_name: categoryName,
      is_duplicate: duplicate,
      include: !duplicate,
    };
  });

  const meta: ImportPreviewMeta = {
    source_filename: file.name,
    file_type: isCsv ? "csv" : "pdf",
    total_rows_detected: raw.totalRowsDetected,
    credit_rows_skipped: raw.transactions.length - debitRows.length,
    unparsed_lines_skipped: raw.unparsedLinesSkipped,
  };

  const response: ImportPreviewResponse = { meta, transactions };
  return NextResponse.json(response);
}
