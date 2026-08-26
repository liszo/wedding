import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/supabase";
import { getGuest } from "@/lib/guest";
import { tooMany, clientIp } from "@/lib/rate-limit";

const BUCKET = "wall";
const MAX_BYTES = 3 * 1024 * 1024;

export async function POST(req: Request) {
  const guest = await getGuest();
  if (!guest)
    return NextResponse.json(
      { message: "اول باید با لینک دعوتت وارد شوی." },
      { status: 401 }
    );

  if (await tooMany(`post:${guest.id}`, 10, 60))
    return NextResponse.json(
      { message: "کمی استراحت کن، بعد دوباره بنویس." },
      { status: 429 }
    );

  const form = await req.formData().catch(() => null);
  if (!form)
    return NextResponse.json({ message: "درخواست نامعتبر." }, { status: 400 });

  const body = String(form.get("body") ?? "").slice(0, 500).trim();
  const file = form.get("image");

  let image_url: string | null = null;

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_BYTES)
      return NextResponse.json({ message: "عکس خیلی بزرگ است." }, { status: 413 });

    const key = `${crypto.randomUUID()}.jpg`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { error: upErr } = await db()
      .storage.from(BUCKET)
      .upload(key, bytes, { contentType: "image/jpeg", upsert: false });

    if (upErr)
      return NextResponse.json(
        { message: "عکس آپلود نشد. دوباره تلاش کن." },
        { status: 500 }
      );

    image_url = db().storage.from(BUCKET).getPublicUrl(key).data.publicUrl;
  }

  if (!body && !image_url)
    return NextResponse.json(
      { message: "یک متن بنویس یا عکسی بگذار." },
      { status: 400 }
    );

  const { error } = await db()
    .from("posts")
    .insert({ guest_id: guest.id, body: body || null, image_url });

  if (error)
    return NextResponse.json({ message: "ثبت نشد." }, { status: 500 });

  return NextResponse.json({ message: "ثبت شد." });
}