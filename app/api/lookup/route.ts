import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { normalizePhone } from "@/lib/phone";
import { makeSessionValue, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import { tooMany, clientIp } from "@/lib/rate-limit";

const SAME = { message: "بررسی شد. صفحه را دوباره باز کنید." };

export async function POST(req: Request) {
  if (await tooMany(`lk:${clientIp(req)}`, 5, 15)) {
    return NextResponse.json(
      { message: "تعداد تلاش زیاد بود. کمی بعد دوباره امتحان کنید." },
      { status: 429 }
    );
  }

  let phone = "";
  try {
    phone = normalizePhone(String((await req.json()).phone ?? ""));
  } catch {
    return NextResponse.json(SAME);
  }

  if (phone.length < 11) return NextResponse.json(SAME);

  const { data } = await db()
    .from("guests")
    .select("id")
    .eq("phone", phone)
    .single();

  const res = NextResponse.json(SAME);
  if (data) {
    res.cookies.set(SESSION_COOKIE, makeSessionValue(data.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
  }
  return res;
}