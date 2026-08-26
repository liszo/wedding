import { isAdmin } from "@/lib/admin";
import { db } from "@/lib/supabase";

function cell(v: string): string {
  return `"${v.replace(/"/g, '""')}"`;
}

export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });

  const { data } = await db()
    .from("guests")
    .select("name, rsvps(attending, party_size, note)")
    .order("name");

  const lines = ["نام,پاسخ,تعداد نفرات,پیام"];

  for (const g of data ?? []) {
    const r = Array.isArray(g.rsvps) ? g.rsvps[0] : g.rsvps;
    const status =
      r == null ? "بی‌پاسخ" : r.attending ? "می‌آید" : "نمی‌آید";
    lines.push(
      [
        cell(g.name as string),
        cell(status),
        cell(r?.attending ? String(r.party_size ?? "") : ""),
        cell(r?.note ?? ""),
      ].join(",")
    );
  }

  return new Response("\uFEFF" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rsvps.csv"`,
    },
  });
}