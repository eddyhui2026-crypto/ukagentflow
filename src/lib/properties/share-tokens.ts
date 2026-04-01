import { randomUUID } from "node:crypto";

/** 64-char hex; matches `db/migrations/010_property_share_tokens.sql` (two UUIDs, no hyphens). */
export function newPropertyShareToken(): string {
  return randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, "");
}
