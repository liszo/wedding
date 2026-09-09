import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/supabase";
import { getGuest } from "@/lib/guest";
// Posting requires a signed-in guest, so the limit keys on the guest rather
// than the IP — a household behind one connection should not throttle itself.
import { tooMany } from "@/lib/rate-limit";
import { isSticker, stickerUrl } from "@/content/stickers";
import { isAllowedGifUrl } from "@/lib/media";
import { wedding } from "@/content/config";
import { toFa } from "@/lib/fa";

const BUCKET = "wall";
const MAX_BYTES = 3 * 1024 * 1024;
/** ~2 minutes of Opus at the bitrate the recorder asks for. */
const MAX_AUDIO_BYTES = 2 * 1024 * 1024;

export async function POST(req: Request) {
  const guest = await getGuest();
  if (!guest)
    return NextResponse.json(
      { message: "اول باید با لینک دعوتت وارد شوی." },
      { status: 401 }
    );

  // Generous enough to send a whole camera roll in one go: the composer
  // uploads a multi-selection as one post per photograph, so a guest picking
  // twenty at once makes twenty requests in about a minute.
  if (await tooMany(`post:${guest.id}`, 40, 60))
    return NextResponse.json(
      { message: "کمی استراحت کن، بعد دوباره بفرست." },
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

  // A GIF is embedded from its own host rather than copied into the bucket —
  // but only from hosts we name, or this becomes an open image proxy that any
  // signed-in guest can point anywhere.
  const gif = form.get("gif");
  if (typeof gif === "string" && gif) {
    if (!isAllowedGifUrl(gif))
      return NextResponse.json({ message: "این گیف پذیرفته نشد." }, { status: 400 });

    const { error } = await db()
      .from("posts")
      .insert({ guest_id: guest.id, body: null, image_url: gif });

    if (error)
      return NextResponse.json({ message: "ثبت نشد." }, { status: 500 });
    return NextResponse.json({ message: "ثبت شد." });
  }

  const body = String(form.get("body") ?? "").slice(0, 500).trim();
  const file = form.get("image");
  const voice = form.get("audio");

  let image_url: string | null = null;
  let uploadedKey: string | null = null;

  if (voice instanceof File && voice.size > 0) {
    if (voice.size > MAX_AUDIO_BYTES)
      return NextResponse.json({ message: "صدا خیلی طولانی است." }, { status: 413 });

    // the extension is what marks this as a voice note when it is read back —
    // see lib/media.ts
    const ext = voice.type.includes("mp4") ? "m4a" : "webm";
    const key = `voice/${crypto.randomUUID()}.${ext}`;
    const bytes = new Uint8Array(await voice.arrayBuffer());

    const { error: upErr } = await db()
      .storage.from(BUCKET)
      .upload(key, bytes, { contentType: voice.type || "audio/webm", upsert: false });

    if (upErr)
      return NextResponse.json(
        { message: "صدا فرستاده نشد. دوباره تلاش کن." },
        { status: 500 }
      );

    uploadedKey = key;
    image_url = db().storage.from(BUCKET).getPublicUrl(key).data.publicUrl;
  } else if (file instanceof File && file.size > 0) {
    if (file.size > MAX_BYTES)
      return NextResponse.json({ message: "عکس خیلی بزرگ است." }, { status: 413 });

    // The cap has always been in content/config.ts and has never been
    // enforced — the wall promised "up to 20 photographs" and would have taken
    // two hundred. Stickers, voice notes and GIFs are excluded: they are not
    // what the cap is about, and they live at paths of their own.
    const { count } = await db()
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("guest_id", guest.id)
      .not("image_url", "is", null)
      .not("image_url", "like", "/stickers/%")
      .not("image_url", "like", "%/voice/%");

    if ((count ?? 0) >= wedding.uploadCap)
      return NextResponse.json(
        {
          message: `تا ${toFa(wedding.uploadCap)} عکس می‌شود گذاشت. برای عکس تازه، یکی از قبلی‌ها را پاک کن.`,
        },
        { status: 409 }
      );

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