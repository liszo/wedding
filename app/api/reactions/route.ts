import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { getGuest } from "@/lib/guest";
import { isKind } from "@/lib/reactions";
import { tooMany } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const guest = await getGuest();
  if (!guest) return NextResponse.json({ ok: false }, { status: 401 });

  if (await tooMany(`react:${guest.id}`, 120, 60))
    return NextResponse.json({ ok: false }, { status: 429 });

  const { post_id, kind } = await req.json().catch(() => ({}));
  if (!post_id || !isKind(kind))
    return NextResponse.json({ ok: false }, { status: 400 });

  const supabase = db();

  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("post_id", post_id)
    .eq("guest_id", guest.id)
    .eq("kind", kind)
    .maybeSingle();

  if (existing) {
    await supabase.from("reactions").delete().eq("id", existing.id);
    return NextResponse.json({ ok: true, on: false });
  }

  const { error } = await supabase
    .from("reactions")
    .insert({ post_id, guest_id: guest.id, kind });

  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true, on: true });
}