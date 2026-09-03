/** Boilerplate lines in SG bank statement PDFs that should never be treated as transaction rows. */
export const NOISE_LINE_PATTERNS: RegExp[] = [
  /statement of account/i,
  /^date\s+description\s+amount/i,
  /^date\s+transaction/i,
  /balance\s*(b\/f|c\/f|brought forward|carried forward)/i,
  /opening balance/i,
  /closing balance/i,
  /page \d+ of \d+/i,
  /^total\b/i,
  /account (no|number)/i,
  /^important/i,
  /generated on/i,
];
