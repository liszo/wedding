import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/supabase";
import { getGuest } from "@/lib/guest";
// Posting requires a signed-in guest, so the limit keys on the guest rather
// than the IP — a household behind one connection should not throttle itself.
import { tooMany } from "@/lib/rate-limit";
import { isSticker, stickerUrl } from "@/content/stickers";

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

  // A sticker sent on its own is a whole message, and it travels in image_url:
  // a sticker is an image, that column holds the URL of one, and the path it
  // is served from is what tells it apart from an uploaded photograph. No new
  // column on a table already carrying real guests' posts.
  const stickerId = form.get("sticker");
  if (typeof stickerId === "string" && isSticker(stickerId)) {
    const { error } = await db()
      .from("posts")
      .insert({ guest_id: guest.id, body: null, image_url: stickerUrl(stickerId) });

    if (error)
      return NextResponse.json({ message: "ثبت نشد." }, { status: 500 });
    return NextResponse.json({ message: "ثبت شد." });
  }

  const body = String(form.get("body") ?? "").slice(0, 500).trim();
  const file = form.get("image");

  let image_url: string | null = null;
  let uploadedKey: string | null = null;

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

    uploadedKey = key;
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

  if (error) {
    // the upload already landed — don't leave it orphaned in the bucket
    if (uploadedKey) await db().storage.from(BUCKET).remove([uploadedKey]);
    return NextResponse.json({ message: "ثبت نشد." }, { status: 500 });
  }

  return NextResponse.json({ message: "ثبت شد." });
}