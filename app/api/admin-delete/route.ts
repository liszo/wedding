import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";

export async function POST(req: Request) {
  if (!(await isAdmin()))
    return NextResponse.json({ ok: false }, { status: 401 });

  const { id } = await req.json().catch(() => ({ id: null }));
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });

  const supabase = db();

  const { data: post } = await supabase
    .from("posts")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();

  if (post?.image_url) {
    const key = String(post.image_url).split("/").pop();
    if (key) await supabase.storage.from("wall").remove([key]);
  }

  await supabase.from("posts").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}