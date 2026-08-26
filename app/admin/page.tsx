import { isAdmin } from "@/lib/admin";
import { db } from "@/lib/supabase";
import AdminLogin from "@/components/AdminLogin";
import { toFa } from "@/lib/fa";

export const dynamic = "force-dynamic";

type Row = {
  name: string;
  attending: boolean | null;
  party_size: number | null;
  note: string | null;
};

async function load(): Promise<Row[]> {
  const { data } = await db()
    .from("guests")
    .select("name, rsvps(attending, party_size, note)")
    .order("name");

  return (data ?? []).map((g) => {
    const r = Array.isArray(g.rsvps) ? g.rsvps[0] : g.rsvps;
    return {
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
  const heads = yes.reduce((s, r) => s + (r.party_size ?? 0), 0);

  const stats = [
    { l: "کل مهمان‌ها", v: rows.length },
    { l: "می‌آیند", v: yes.length },
    { l: "نمی‌آیند", v: no.length },
    { l: "بی‌پاسخ", v: silent.length },
    { l: "تعداد نفرات", v: heads },
  ];

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg text-candle">پاسخ‌ها</h1>
        <a
          href="/admin/export"
          className="rounded-xl bg-candle px-4 py-2 text-sm font-medium text-night"
        >
          دانلود CSV
        </a>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map((s) => (
          <div
            key={s.l}
            className="rounded-2xl bg-raised/70 p-4 text-center ring-1 ring-candle/10"
          >
            <div className="tabular text-2xl text-candle">{toFa(s.v)}</div>
            <div className="mt-1 text-xs text-mist/45">{s.l}</div>
          </div>
        ))}
      </div>

      <table className="w-full text-sm">
        <thead className="text-xs text-mist/40">
          <tr className="border-b border-mist/10">
            <th className="p-2 text-start">نام</th>
            <th className="p-2 text-start">پاسخ</th>
            <th className="p-2 text-start">نفر</th>
            <th className="p-2 text-start">پیام</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-b border-mist/5">
              <td className="p-2">{r.name}</td>
              <td className="p-2">
                {r.attending === null ? (
                  <span className="text-mist/35">—</span>
                ) : r.attending ? (
                  <span className="text-candle">می‌آید</span>
                ) : (
                  <span className="text-mist/50">نمی‌آید</span>
                )}
              </td>
              <td className="tabular p-2">
                {r.party_size ? toFa(r.party_size) : ""}
              </td>
              <td className="p-2 text-mist/60">{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}