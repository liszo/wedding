import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { getGuest } from "@/lib/guest";
import { tooMany } from "@/lib/rate-limit";
import { storageKey } from "@/lib/media";

/**
 * Editing and deleting your own message.
 *
 * Both operations name the row *and* the guest in the same `.eq()` chain, so
 * ownership is enforced by the query rather than by a check the handler could
 * be refactored past. The service-role key bypasses row-level security, so a
 * read-then-write would be a hole: two requests racing on the same id could
 * pass the check and then act on someone else's row.
 */

const TABLE = { post: "posts", reply: "comments" } as const;
type Target = keyof typeof TABLE;

function parse(payload: unknown): { table: string; id: string } | null {
  const { id, kind } = (payload ?? {}) as { id?: string; kind?: string };
  if (!id || typeof id !== "string") return null;
  if (kind !== "post" && kind !== "reply") return null;
  return { table: TABLE[kind as Target], id };
}

export async function PATCH(req: Request) {
  const guest = await getGuest();
  if (!guest)
    return NextResponse.json(
      { message: "اول باید با لینک دعوتت وارد شوی." },
      { status: 401 }
    );

  if (await tooMany(`edit:${guest.id}`, 30, 60))
    return NextResponse.json({ message: "کمی استراحت کن." }, { status: 429 });

  const payload = await req.json().catch(() => null);
  const target = parse(payload);
  if (!target)
    return NextResponse.json({ message: "درخواست نامعتبر." }, { status: 400 });

  const body = String((payload as { body?: string }).body ?? "")
    .slice(0, 500)
    .trim();
  if (!body)
    return NextResponse.json({ message: "متن خالی است." }, { status: 400 });

  const { data, error } = await db()
    .from(target.table)
    .update({ body })
    .eq("id", target.id)
    .eq("guest_id", guest.id)
    .select("id");

  if (error)
    return NextResponse.json({ message: "ثبت نشد." }, { status: 500 });
  if (!data?.length)
    return NextResponse.json(
      { message: "این پیام مال تو نیست." },
      { status: 403 }
    );

  return NextResponse.json({ message: "ویرایش شد." });
}

export async function DELETE(req: Request) {
  const guest = await getGuest();
  if (!guest)
    return NextResponse.json(
      { message: "اول باید با لینک دعوتت وارد شوی." },
      { status: 401 }
    );

  if (await tooMany(`del:${guest.id}`, 30, 60))
    return NextResponse.json({ message: "کمی استراحت کن." }, { status: 429 });

  const target = parse(await req.json().catch(() => null));
  if (!target)
    return NextResponse.json({ message: "درخواست نامعتبر." }, { status: 400 });

  // read the attachment first: once the row is gone there is nothing left to
  // tell us which file in the bucket belonged to it
  let key: string | null = null;
  if (target.table === "posts") {
    const { data } = await db()
      .from("posts")
      .select("image_url")
      .eq("id", target.id)
      .eq("guest_id", guest.id)
      .maybeSingle();
    key = storageKey(data?.image_url ?? null);
  }

  const { data, error } = await db()
    .from(target.table)
    .delete()
    .eq("id", target.id)
    .eq("guest_id", guest.id)
    .select("id");

  if (error)
    return NextResponse.json({ message: "حذف نشد." }, { status: 500 });
  if (!data?.length)
    return NextResponse.json(
      { message: "این پیام مال تو نیست." },
      { status: 403 }
    );

  if (key) await db().storage.from("wall").remove([key]);

  return NextResponse.json({ message: "حذف شد." });
}
