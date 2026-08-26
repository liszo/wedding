import crypto from "crypto";

const ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function makeToken(): string {
  return Array.from(crypto.randomBytes(12))
    .map((b) => ALPHABET[b % 62])
    .join("");
}