/** Parses a bank-statement amount cell into positive integer cents, or null if it's empty/unparseable. */
export function parseAmountToCents(raw: string | undefined | null): number | null {
  if (!raw) return null;

  const trimmed = raw.trim();
  if (trimmed === "") return null;

  const isParenNegative = /^\(.*\)$/.test(trimmed);
  const cleaned = trimmed
    .replace(/^\(|\)$/g, "")
    .replace(/S\$|SGD|\$/gi, "")
    .replace(/,/g, "")
    .replace(/\s+/g, "")
    .replace(/^-/, "");

  if (cleaned === "" || isNaN(Number(cleaned))) return null;

  const value = Math.round(Math.abs(parseFloat(cleaned)) * 100);
  if (value === 0 && !isParenNegative) return null;
  return value;
}
