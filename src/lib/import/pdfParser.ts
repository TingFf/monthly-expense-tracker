import { extractText, getDocumentProxy } from "unpdf";
import type { RawTransaction } from "@/lib/import/types";
import { parseAmountToCents } from "@/lib/import/amount";
import { parseStatementDate } from "@/lib/import/date";
import { NOISE_LINE_PATTERNS } from "@/lib/import/noise";

const LEADING_DATE_PATTERN = /^(\d{1,2}[\/\- ](?:\d{1,2}|[A-Za-z]{3})[\/\- ]\d{2,4})\s+(.*)$/;
const AMOUNT_TOKEN_PATTERN = /\(?-?[\d,]+\.\d{2}\)?/g;

/**
 * Best-effort, line-based extraction of transaction rows from a bank statement PDF's text.
 * Statement layouts vary by bank/template, so this is a heuristic, not a guarantee — that's
 * why the app always shows a review/preview step before importing anything it finds here.
 */
export async function parsePdfStatement(buffer: Buffer): Promise<{
  transactions: RawTransaction[];
  totalRowsDetected: number;
  unparsedLinesSkipped: number;
}> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  const combined = Array.isArray(text) ? text.join("\n") : text;
  const lines = combined
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  return extractTransactionsFromLines(lines);
}

function extractTransactionsFromLines(lines: string[]): {
  transactions: RawTransaction[];
  totalRowsDetected: number;
  unparsedLinesSkipped: number;
} {
  const transactions: RawTransaction[] = [];
  let unparsedLinesSkipped = 0;
  let previousBalanceCents: number | null = null;
  let lastTxIndex = -1;
  let continuationLinesUsed = 0;

  for (const line of lines) {
    if (NOISE_LINE_PATTERNS.some((p) => p.test(line))) continue;

    const dateMatch = line.match(LEADING_DATE_PATTERN);
    if (!dateMatch) {
      const hasAmount = AMOUNT_TOKEN_PATTERN.test(line);
      AMOUNT_TOKEN_PATTERN.lastIndex = 0; // reset stateful global regex before reuse
      if (lastTxIndex >= 0 && !hasAmount && continuationLinesUsed < 2 && line.length < 60) {
        transactions[lastTxIndex].description += ` ${line}`;
        continuationLinesUsed++;
      }
      continue;
    }

    continuationLinesUsed = 0;
    const date = parseStatementDate(dateMatch[1]);
    const remainder = dateMatch[2];
    const numberTokens = [...remainder.matchAll(AMOUNT_TOKEN_PATTERN)].map((m) => m[0]);

    if (!date || numberTokens.length === 0) {
      unparsedLinesSkipped++;
      continue;
    }

    const amountToken = numberTokens.length === 1 ? numberTokens[0] : numberTokens[numberTokens.length - 2];
    const balanceToken = numberTokens.length >= 2 ? numberTokens[numberTokens.length - 1] : null;
    const amount_cents = parseAmountToCents(amountToken);
    const balance_cents = balanceToken ? parseAmountToCents(balanceToken) : null;

    if (amount_cents === null) {
      unparsedLinesSkipped++;
      continue;
    }

    const description = remainder
      .replace(amountToken, "")
      .replace(balanceToken ?? "", "")
      .replace(/\b(DR|CR)\b/g, "")
      .replace(/\s+/g, " ")
      .trim();

    let direction: "debit" | "credit" | null = null;
    if (/\bDR\b/.test(remainder)) direction = "debit";
    else if (/\bCR\b/.test(remainder)) direction = "credit";
    else if (/^\(/.test(amountToken)) direction = "debit";
    else if (balance_cents !== null && previousBalanceCents !== null) {
      if (balance_cents < previousBalanceCents) direction = "debit";
      else if (balance_cents > previousBalanceCents) direction = "credit";
    }

    if (balance_cents !== null) previousBalanceCents = balance_cents;

    if (!description || direction === null) {
      unparsedLinesSkipped++;
      continue; // don't guess direction — skip rather than risk miscounting income as an expense
    }

    transactions.push({ date, description, amount_cents, direction });
    lastTxIndex = transactions.length - 1;
  }

  return { transactions, totalRowsDetected: transactions.length, unparsedLinesSkipped };
}
