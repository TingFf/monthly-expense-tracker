# Monthly Expense Tracker

A personal web app for tracking monthly expenses by category — food, transport, subscriptions, utilities, and any custom categories you add.

## Features

- Add, edit, and delete expenses with amount, category, date, description, and payment method
- Extensible categories (edit colors/icons, add your own, seeded defaults included)
- Dashboard with current-month total and a category breakdown chart
- Filterable expense list (by month, category, description search)
- Monthly reports with category breakdown and a 6-month spending trend chart
- All data stored locally in a SQLite file — nothing leaves your machine

## Tech stack

- [Next.js](https://nextjs.org/) (App Router) + TypeScript
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) for local persistence
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Recharts](https://recharts.org/) for charts
- [Zod](https://zod.dev/) for validation, [react-hook-form](https://react-hook-form.com/) for forms

## Getting started

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The SQLite database and its tables are created automatically on first run.

## Data storage

Expense and category data lives in `data/expenses.db`, a local SQLite file. This folder is gitignored — your real expense data is never committed. Back it up by copying `data/expenses.db` somewhere safe.

## npm scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript compiler with no output |
| `npm run db:init` | Manually verify/initialize the database |

## Project structure

```
src/
  app/            # Pages and API routes (Next.js App Router)
  components/     # UI components
  lib/            # Database, queries, validation, utilities
  types/          # Shared TypeScript types
scripts/
  init-db.ts      # Manual database init/check script
data/
  expenses.db     # SQLite database (gitignored)
```

## Roadmap / ideas

- Monthly budget limits per category with over-budget warnings
- Recurring subscription tracking and reminders
- CSV export/import
- Dark mode
- Year-in-review summary
- Receipt photo attachments
- Savings goal tracking
- Data backup/restore
