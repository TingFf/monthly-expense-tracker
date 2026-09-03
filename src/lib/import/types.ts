export interface RawTransaction {
  date: string; // "YYYY-MM-DD"
  description: string;
  amount_cents: number; // always positive
  direction: "debit" | "credit";
}

export interface ParsedTransaction {
  row_index: number; // position within this parse response, not a DB id
  date: string;
  description: string;
  amount_cents: number;
  suggested_category_id: number;
  suggested_category_name: string;
  is_duplicate: boolean;
  include: boolean;
}

export interface ImportPreviewMeta {
  source_filename: string;
  file_type: "csv" | "pdf";
  total_rows_detected: number;
  credit_rows_skipped: number;
  unparsed_lines_skipped: number;
}

export interface ImportPreviewResponse {
  meta: ImportPreviewMeta;
  transactions: ParsedTransaction[];
}

export class ImportParseError extends Error {}
