import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { getGuest } from "@/lib/guest";
import { tooMany } from "@/lib/rate-limit";
import { isSticker } from "@/content/stickers";

export async function POST(req: Request) {
  const guest = await getGuest();
  if (!guest)
    return NextResponse.json(
      { message: "اول باید با لینک دعوتت وارد شوی." },
      { status: 401 }
    );

  if (await tooMany(`cmt:${guest.id}`, 30, 60))
    return NextResponse.json({ message: "کمی استراحت کن." }, { status: 429 });

  const payload = await req.json().catch(() => ({}));
  const { post_id } = payload;
  if (!post_id)
    return NextResponse.json({ message: "درخواست نامعتبر." }, { status: 400 });

  const sticker = isSticker(payload.sticker) ? payload.sticker : null;
  const text = sticker ? null : String(payload.body ?? "").slice(0, 300).trim();

  if (!sticker && !text)
    return NextResponse.json({ message: "چیزی بنویس." }, { status: 400 });

  const { error } = await db()
    .from("comments")
    .insert({ post_id, guest_id: guest.id, body: text, sticker });

  if (error)
    return NextResponse.json({ message: "ثبت نشد." }, { status: 500 });

  return NextResponse.json({ message: "ok" });
}