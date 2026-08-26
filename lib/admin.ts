import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE = "wa";

function expected(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET missing");
  return crypto.createHmac("sha256", s).update("admin").digest("hex");
}

export function adminCookieValue(): string {
  return expected();
}

export function checkPassword(input: string): boolean {
  const real = process.env.ADMIN_PASSWORD ?? "";
  const a = Buffer.from(input);
  const b = Buffer.from(real);
  if (!real || a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const v = store.get(COOKIE)?.value;
  if (!v) return false;
  const e = expected();
  const a = Buffer.from(v);
  const b = Buffer.from(e);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export const ADMIN_COOKIE = COOKIE;