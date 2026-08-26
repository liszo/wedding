import { NextResponse } from "next/server";
import { checkPassword, adminCookieValue, ADMIN_COOKIE } from "@/lib/admin";
import { tooMany, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  if (await tooMany(`adm:${clientIp(req)}`, 5, 15))
    return NextResponse.json({ ok: false }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  if (!checkPassword(String(body.password ?? "")))
    return NextResponse.json({ ok: false }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, adminCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}