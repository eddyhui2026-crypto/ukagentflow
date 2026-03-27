/**
 * Applies db/migrations/*.sql in order, skipping files recorded in schema_migrations.
 * Loads DATABASE_URL from .env.local then .env (project root).
 */
import { readdirSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

config({ path: join(root, ".env.local") });
config({ path: join(root, ".env") });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Missing DATABASE_URL. Add it to .env.local");
  process.exit(1);
}

const migrationsDir = join(root, "db", "migrations");
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.error("No .sql files in db/migrations");
  process.exit(1);
}

const client = new pg.Client({ connectionString: url });
await client.connect();

try {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  const { rows: countRows } = await client.query(
    "SELECT COUNT(*)::int AS n FROM schema_migrations",
  );
  const n = countRows[0]?.n ?? 0;
  if (n === 0) {
    const { rows: reg } = await client.query(
      "SELECT to_regclass('public.companies') AS reg",
    );
    if (reg[0]?.reg) {
      await client.query(
        "INSERT INTO schema_migrations (filename) VALUES ('001_initial.sql')",
      );
      console.log("Note: DB already had tables — marked 001_initial.sql as applied.");
    }
  }

  for (const file of files) {
    const { rows: done } = await client.query(
      "SELECT 1 FROM schema_migrations WHERE filename = $1",
      [file],
    );
    if (done.length > 0) {
      console.log("Skip:", file);
      continue;
    }
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    await client.query(sql);
    await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [
      file,
    ]);
    console.log("OK:", file);
  }
} finally {
  await client.end();
}

console.log("Migrations finished.");
