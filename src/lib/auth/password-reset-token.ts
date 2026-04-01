import { createHash, randomBytes } from "node:crypto";

export const PASSWORD_RESET_TOKEN_HEX_LENGTH = 64;

export function generatePasswordResetRawToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashPasswordResetToken(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}

export function isPasswordResetTokenFormat(raw: string): boolean {
  return /^[a-f0-9]{64}$/i.test(raw);
}
