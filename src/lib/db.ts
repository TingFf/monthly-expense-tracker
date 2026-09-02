import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

declare global {
  var __expenseTrackerDb: Database.Database | undefined;
}

function createConnection(): Database.Database {
  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });

  const dbPath = path.join(dataDir, "expenses.db");
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  const schema = fs.readFileSync(path.join(process.cwd(), "src", "lib", "schema.sql"), "utf-8");
  db.exec(schema);

  return db;
}

// Cached on globalThis so Next.js dev hot-reload doesn't open a new
// connection (and re-run the schema) on every module reload.
export const db: Database.Database = globalThis.__expenseTrackerDb ?? createConnection();

if (process.env.NODE_ENV !== "production") {
  globalThis.__expenseTrackerDb = db;
}
