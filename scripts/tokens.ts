import crypto from "crypto";

const ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function makeToken(): string {
  return Array.from(crypto.randomBytes(12))
    .map((b) => ALPHABET[b % 62])
    .join("");
}

export function normalizePhone(raw: string): string {
  const fa = "۰۱۲۳۴۵۶۷۸۹";
  const ar = "٠١٢٣٤٥٦٧٨٩";
  let s = raw
    .replace(/[۰-۹]/g, (d) => String(fa.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ar.indexOf(d)))
    .replace(/\D/g, "");
  if (s.startsWith("98")) s = s.slice(2);
  if (s.startsWith("0")) s = s.slice(1);
  return "0" + s;
}

// Temporary check — delete these lines once you've seen it work
const samples = [
  "09123456789",
  "+98 912 345 6789",
  "۰۹۱۲۳۴۵۶۷۸۹",
  "0912-345-6789",
];
for (const s of samples) console.log(s.padEnd(20), "->", normalizePhone(s));
console.log("token:", makeToken());