import { isAdmin } from "@/lib/admin";
import { db } from "@/lib/supabase";
import AdminLogin from "@/components/AdminLogin";
import { toFa } from "@/lib/fa";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  name: string;
  attending: boolean | null;
  party_size: number | null;
  note: string | null;
};

async function load(): Promise<Row[]> {
  const { data } = await db()
    .from("guests")
    // id comes along so the table can key on something unique — two guests
    // can share a name, and React silently drops the duplicate row if it
    // keys on that
    .select("id, name, rsvps(attending, party_size, note)")
    .order("name");

  return (data ?? []).map((g) => {
    const r = Array.isArray(g.rsvps) ? g.rsvps[0] : g.rsvps;
    return {
      id: g.id as string,
      name: g.name as string,
      attending: r?.attending ?? null,
      party_size: r?.party_size ?? null,
      note: r?.note ?? null,
    };
  });
}

export default async function Admin() {
  if (!(await isAdmin())) return <AdminLogin />;

  const rows = await load();
  const yes = rows.filter((r) => r.attending === true);
  const no = rows.filter((r) => r.attending === false);
  const silent = rows.filter((r) => r.attending === null);
  // party_size defaults to 1 for anyone who said yes without setting a count
  const heads = yes.reduce((s, r) => s + (r.party_size ?? 1), 0);

  const stats = [
    { l: "کل مهمان‌ها", v: rows.length },
    { l: "می‌آیند", v: yes.length },
    { l: "نمی‌آیند", v: no.length },
    { l: "بی‌پاسخ", v: silent.length },
    { l: "تعداد نفرات", v: heads },
  ];

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="nastaliq text-3xl text-gold-deep">پاسخ‌ها</h1>
        <a
          href="/admin/export"
          className="shrink-0 rounded-xl bg-olive px-4 py-2 text-sm font-medium text-paper transition hover:bg-olive-deep"
        >
          دانلود CSV
        </a>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map((s) => (
          <div key={s.l} className="leaf rounded-2xl p-4 text-center">
            <div className="tabular text-2xl text-gold-ink">{toFa(s.v)}</div>
            <div className="mt-1 text-xs text-muted">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[30rem] text-sm">
          <thead className="text-xs text-muted">
            <tr className="border-b border-gold-pale">
              <th className="p-2 text-start font-normal">نام</th>
              <th className="p-2 text-start font-normal">پاسخ</th>
              <th className="p-2 text-start font-normal">نفر</th>
              <th className="p-2 text-start font-normal">پیام</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-gold-pale">
                <td className="p-2">{r.name}</td>
                <td className="p-2">
                  {r.attending === null ? (
                    <span className="text-muted/70">—</span>
                  ) : r.attending ? (
                    <span className="text-olive">می‌آید</span>
                  ) : (
                    <span className="text-muted">نمی‌آید</span>
                  )}
                </td>
                <td className="tabular p-2">
                  {r.party_size ? toFa(r.party_size) : ""}
                </td>
                <td className="p-2 text-muted">{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
