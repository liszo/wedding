import crypto from "crypto";

const COOKIE = "wg";

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET missing");
  return s;
}

function sign(id: string): string {
  return crypto.createHmac("sha256", secret()).update(id).digest("hex");
}

export function makeSessionValue(guestId: string): string {
  return `${guestId}.${sign(guestId)}`;
}

export function readSessionValue(value: string | undefined): string | null {
  if (!value) return null;
  const i = value.lastIndexOf(".");
  if (i < 1) return null;
  const id = value.slice(0, i);
  const mac = value.slice(i + 1);
  const expected = sign(id);
  const a = Buffer.from(mac, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return null;
  return crypto.timingSafeEqual(a, b) ? id : null;
}

export const SESSION_COOKIE = COOKIE;
export const SESSION_MAX_AGE = 60 * 60 * 24 * 365;