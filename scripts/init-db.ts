import { db } from "../src/lib/db";

const categoryCount = db.prepare("SELECT COUNT(*) as count FROM categories").get() as {
  count: number;
};

console.log(`Database ready at data/expenses.db (${categoryCount.count} categories seeded).`);
