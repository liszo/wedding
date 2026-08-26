import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { makeSessionValue, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import { tooMany, clientIp } from "@/lib/rate-limit";

export async function GET(req: Request, ctx: RouteContext<"/i/[token]">) {
  const { token } = await ctx.params;
  const home = new URL("/", req.url);

  if (await tooMany(`tok:${clientIp(req)}`, 20, 10)) {
    home.searchParams.set("e", "slow");
    return NextResponse.redirect(home);
  }

  const { data } = await db()
    .from("guests")
    .select("id")
    .eq("token", token)
    .single();

  if (!data) {
    home.searchParams.set("e", "bad");
    return NextResponse.redirect(home);
  }

  const res = NextResponse.redirect(home);
  res.cookies.set(SESSION_COOKIE, makeSessionValue(data.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}