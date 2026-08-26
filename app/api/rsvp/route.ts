import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { getGuest } from "@/lib/guest";
import { rsvpClosed } from "@/lib/rsvp";
import { tooMany, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const guest = await getGuest();
  if (!guest)
    return NextResponse.json(
      { message: "اول باید با لینک دعوتت وارد شوی." },
      { status: 401 }
    );

  if (rsvpClosed())
    return NextResponse.json(
      { message: "مهلت پاسخ به پایان رسیده. لطفاً مستقیم به ما پیام بده." },
      { status: 403 }
    );

  if (await tooMany(`rsvp:${clientIp(req)}`, 15, 10))
    return NextResponse.json(
      { message: "کمی بعد دوباره امتحان کن." },
      { status: 429 }
    );

  const body = await req.json().catch(() => null);
  if (!body)
    return NextResponse.json({ message: "درخواست نامعتبر." }, { status: 400 });

  const attending = Boolean(body.attending);
  const size = Number(body.party_size);
  const party_size = attending
    ? Math.min(10, Math.max(1, Number.isFinite(size) ? Math.trunc(size) : 1))
    : 0;
  const note = String(body.note ?? "").slice(0, 300).trim() || null;

  const { error } = await db()
    .from("rsvps")
    .upsert(
      { guest_id: guest.id, attending, party_size, note },
      { onConflict: "guest_id" }
    );

  if (error)
    return NextResponse.json(
      { message: "ثبت نشد. دوباره تلاش کن." },
      { status: 500 }
    );

  return NextResponse.json({
    message: attending ? "ثبت شد. منتظرت هستیم." : "ثبت شد. جایت خالی خواهد بود.",
  });
}