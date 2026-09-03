# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Next.js version

This project uses **Next.js 16** (`AGENTS.md` in this repo, auto-managed by `next dev`, flags this explicitly). APIs, conventions, and file structure may differ from training data — notably, route `params` and page `searchParams` are `Promise`s that must be `await`ed (not plain objects as in Next.js 14 and earlier). Check `node_modules/next/dist/docs/` before assuming an API from memory. Do not delete the `<!-- BEGIN/END:nextjs-agent-rules -->` block in `AGENTS.md`; `next dev` re-adds it automatically, so removing it just creates repeated uncommitted diffs.

## Commands

```bash
npm run dev        # start dev server (Turbopack) at localhost:3000
npm run build      # production build
npm run start      # run the production build
npm run lint       # ESLint (flat config, eslint.config.mjs)
npm run typecheck  # tsc --noEmit
npm run db:init    # verify/initialize data/expenses.db (also happens automatically on first import of src/lib/db.ts)
```

There is no test suite configured in this project.

On Windows, `node`/`npm` may not be on PATH in a fresh shell even after installing Node — refresh it per-session with:
```powershell
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
```

## Architecture

Single Next.js App Router project (no separate backend). Server Components read data by calling the query layer directly; only writes (and any client-side interactivity) go through the API routes under `src/app/api/`.

- **`src/lib/db.ts`** — the single `better-sqlite3` connection, cached on `globalThis` so Next.js dev-mode hot reload doesn't reopen the database or re-run the schema on every edit. On creation it runs `src/lib/schema.sql` (idempotent `CREATE TABLE IF NOT EXISTS` / `INSERT OR IGNORE`), so the database self-initializes on first use — no manual migration step. The file lives at `data/expenses.db`, created on demand and gitignored.
- **`src/lib/schema.sql`** — the two tables (`categories`, `expenses`) and the four seeded default categories (Food, Transport, Subscriptions, Utilities). `expenses.category_id` has `ON DELETE RESTRICT`; category deletion is guarded in application code (`src/lib/queries/categories.ts` `isCategoryInUse`/`deleteCategory`) rather than relying on the DB error.
- **`src/lib/queries/*.ts`** — the only place raw SQL lives. `expenses.ts` and `categories.ts` are plain CRUD; `summary.ts` does the monthly aggregation (`getMonthlySummary`) and multi-month trend (`getMonthlyTrend`) used by the dashboard and reports page. Pages call these functions directly (server-side); nothing fetches the app's own API from a Server Component.
- **`src/lib/validation.ts`** — zod schemas shared between API routes' input validation and the inferred TS types used by forms.
- **Money is stored as integer cents** (`amount_cents`) everywhere in the DB and API to avoid floating-point rounding; conversion to/from dollars for display only happens at the UI edge (`src/lib/utils.ts`: `centsToDisplay`, `dollarsToCents`).
- **API routes** (`src/app/api/**/route.ts`) are thin: parse/validate with zod, call the query layer, return JSON. All declare `export const runtime = "nodejs"` since `better-sqlite3` is a native module and cannot run on the Edge runtime.
- **Client components that mutate data** (`ExpenseForm`, `ExpenseTable`, `CategoryForm`, `CategoryList`) call the API routes with `fetch`, then `router.refresh()` (and `router.push()` for forms) to re-run the Server Component data fetch — there is no separate client-side cache/store.
- **Pages that read request-time state** (`searchParams`, "today") declare `export const dynamic = "force-dynamic"` so they aren't statically prerendered at build time with stale data — this matters because the project does not have Next's `cacheComponents` flag enabled, so App Router's default (Next 15-era) static/dynamic heuristics apply.
- Path alias `@/*` maps to `src/*` (see `tsconfig.json`).

## GitHub

The repo is pushed to `https://github.com/angfamilyxd/monthly-expense-tracker` (private), via the `gh` CLI already authenticated as `angfamilyxd`.
