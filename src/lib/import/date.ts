import { parse, isValid, format } from "date-fns";

const CANDIDATE_FORMATS = [
  "yyyy-MM-dd",
  "dd/MM/yyyy",
  "dd-MM-yyyy",
  "d/M/yyyy",
  "d MMM yyyy",
  "dd MMM yyyy",
  "d MMMM yyyy",
  "MM/dd/yyyy",
];

/** Parses a bank statement date cell/token into "YYYY-MM-DD", or null if it can't be resolved. */
export function parseStatementDate(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed === "") return null;

  for (const fmt of CANDIDATE_FORMATS) {
    const parsed = parse(trimmed, fmt, new Date());
    if (isValid(parsed)) {
      return format(parsed, "yyyy-MM-dd");
    }
  }
  return null;
}
