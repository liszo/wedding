import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { getGuest } from "@/lib/guest";
import { tooMany } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const guest = await getGuest();
  if (!guest)
    return NextResponse.json(
      { message: "اول باید با لینک دعوتت وارد شوی." },
      { status: 401 }
    );

  if (await tooMany(`cmt:${guest.id}`, 30, 60))
    return NextResponse.json(
      { message: "کمی استراحت کن." },
      { status: 429 }
    );

  const { post_id, body } = await req.json().catch(() => ({}));
  const text = String(body ?? "").slice(0, 300).trim();

  if (!post_id || !text)
    return NextResponse.json({ message: "چیزی بنویس." }, { status: 400 });

  const { error } = await db()
    .from("comments")
    .insert({ post_id, guest_id: guest.id, body: text });

  if (error)
    return NextResponse.json({ message: "ثبت نشد." }, { status: 500 });

  return NextResponse.json({ message: "ok" });
}