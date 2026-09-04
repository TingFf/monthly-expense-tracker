CREATE TABLE IF NOT EXISTS categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL UNIQUE,
  color       TEXT NOT NULL DEFAULT '#64748B',
  icon        TEXT,
  is_default  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS expenses (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  amount_cents    INTEGER NOT NULL,
  category_id     INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  description     TEXT,
  date            TEXT NOT NULL,
  payment_method  TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);

CREATE TABLE IF NOT EXISTS monthly_income (
  month         TEXT PRIMARY KEY, -- 'YYYY-MM'
  amount_cents  INTEGER NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO categories (name, color, icon, is_default) VALUES
  ('Food', '#F59E0B', '🍔', 1),
  ('Transport', '#3B82F6', '🚌', 1),
  ('Subscriptions', '#8B5CF6', '📺', 1),
  ('Utilities', '#10B981', '💡', 1),
  ('Etc', '#94A3B8', '🗂️', 1);
