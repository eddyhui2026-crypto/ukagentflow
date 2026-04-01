import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let sql: NeonQueryFunction<false, false> | null = null;

/**
 * Server-side Neon SQL client (PostgreSQL over HTTP). Use only in Server
 * Components, Route Handlers, and Server Actions — never in the browser.
 */
export function getSql(): NeonQueryFunction<false, false> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Missing DATABASE_URL (Neon connection string)");
  }
  if (!sql) {
    sql = neon(url);
  }
  return sql;
}
