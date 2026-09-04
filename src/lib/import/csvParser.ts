import { parse } from "csv-parse/sync";
import { ImportParseError, type RawTransaction } from "@/lib/import/types";
import { parseAmountToCents } from "@/lib/import/amount";
import { parseStatementDate } from "@/lib/import/date";

const HEADER_ALIASES: Record<string, string[]> = {
  date: ["date", "transaction date", "posting date", "value date", "txn date"],
  description: [
    "description", "transaction description", "details", "narrative", "reference",
    "particulars", "transaction ref",
  ],
  debit: ["debit", "withdrawal", "withdrawal amount", "debit amount", "amount (debit)", "dr amount"],
  credit: ["credit", "deposit", "deposit amount", "credit amount", "amount (credit)", "cr amount"],
  amount: ["amount", "transaction amount"],
  type: ["transaction type", "type", "dr/cr", "cr/dr", "debit/credit"],
};

interface ColumnMap {
  date: string;
  description: string;
  debit?: string;
  credit?: string;
  amount?: string;
  type?: string;
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, " ");
}

function findColumn(headers: string[], aliases: string[]): string | undefined {
  const normalizedHeaders = headers.map((h) => ({ raw: h, normalized: normalizeHeader(h) }));
  for (const alias of aliases) {
    const exact = normalizedHeaders.find((h) => h.normalized === alias);
    if (exact) return exact.raw;
  }
  for (const alias of aliases) {
    const partial = normalizedHeaders.find((h) => h.normalized.includes(alias));
    if (partial) return partial.raw;
  }
  return undefined;
}

function tryDetectColumns(headers: string[]): ColumnMap | undefined {
  const date = findColumn(headers, HEADER_ALIASES.date);
  const description = findColumn(headers, HEADER_ALIASES.description);
  if (!date || !description) return undefined;

  const debit = findColumn(headers, HEADER_ALIASES.debit);
  const credit = findColumn(headers, HEADER_ALIASES.credit);
  const amount = findColumn(headers, HEADER_ALIASES.amount);
  const type = findColumn(headers, HEADER_ALIASES.type);

  if (!debit && !credit && !amount) return undefined;

  return { date, description, debit, credit, amount, type };
}

export function parseCsvStatement(fileContent: string): {
  transactions: RawTransaction[];
  totalRowsDetected: number;
} {
  let rows: string[][];
  try {
    rows = parse(fileContent, {
      columns: false,
      skip_empty_lines: true,
      trim: true,
      bom: true,
      relax_column_count: true,
    }) as string[][];
  } catch {
    throw new ImportParseError("Could not read this file as CSV.");
  }

  if (rows.length === 0) {
    throw new ImportParseError("No rows found in this CSV.");
  }

  // Bank exports (e.g. POSB/DBS) often prefix the transaction table with
  // account/balance summary rows, so the real header isn't necessarily row 0 —
  // scan for the first row that actually looks like one instead of assuming it is.
  let headerRowIndex = -1;
  let columns: ColumnMap | undefined;
  for (let i = 0; i < rows.length; i++) {
    const candidate = tryDetectColumns(rows[i]);
    if (candidate) {
      headerRowIndex = i;
      columns = candidate;
      break;
    }
  }

  if (!columns) {
    throw new ImportParseError(
      "Couldn't find a date, description, and amount column in this CSV — check that it's an unedited export from your bank."
    );
  }

  const header = rows[headerRowIndex];
  const records: Record<string, string>[] = rows.slice(headerRowIndex + 1).map((row) => {
    const record: Record<string, string> = {};
    header.forEach((h, idx) => {
      record[h] = row[idx] ?? "";
    });
    return record;
  });

  const transactions: RawTransaction[] = [];

  for (const record of records) {
    const date = parseStatementDate(record[columns.date]);
    const description = (record[columns.description] ?? "").replace(/\s+/g, " ").trim();
    if (!date || !description) continue; // section headers / balance-only rows

    let amount_cents: number | null = null;
    let direction: "debit" | "credit" | null = null;

    if (columns.debit || columns.credit) {
      const debitVal = columns.debit ? parseAmountToCents(record[columns.debit]) : null;
      const creditVal = columns.credit ? parseAmountToCents(record[columns.credit]) : null;
      if (debitVal) {
        amount_cents = debitVal;
        direction = "debit";
      } else if (creditVal) {
        amount_cents = creditVal;
        direction = "credit";
      }
    } else if (columns.amount) {
      const raw = record[columns.amount] ?? "";
      const parsed = parseAmountToCents(raw);
      if (parsed !== null) {
        amount_cents = parsed;
        const typeVal = columns.type ? (record[columns.type] ?? "").toUpperCase() : "";
        if (typeVal.includes("CR")) direction = "credit";
        else if (typeVal.includes("DR")) direction = "debit";
        else direction = raw.trim().startsWith("-") || raw.includes("(") ? "credit" : "debit";
      }
    }

    if (amount_cents !== null && direction !== null) {
      transactions.push({ date, description, amount_cents, direction });
    }
  }

  return { transactions, totalRowsDetected: transactions.length };
}
