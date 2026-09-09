import { db } from "./supabase";

/**
 * Rows older than this can never affect a decision: the longest window any
 * caller asks for is an hour, so anything past it is landfill.
 */
const KEEP_MINUTES = 120;

/**
 * Sweeps roughly one call in fifty.
 *
 * Every post, reaction, comment, edit, delete and GIF search writes a row here
 * and nothing ever removed one, so the table only grew — and `tooMany` counts
 * over it on every single action. A cron job would be tidier; this needs no
 * infrastructure and the cost lands on one request in fifty rather than on a
 * schedule nobody will remember to check.
 */
async function sweep() {
  if (Math.random() > 0.02) return;
  const cutoff = new Date(Date.now() - KEEP_MINUTES * 60_000).toISOString();
  await db().from("rate_limits").delete().lt("created_at", cutoff);
}

export async function tooMany(key: string, limit: number, minutes: number) {
  const supabase = db();
  const since = new Date(Date.now() - minutes * 60_000).toISOString();

  const { count } = await supabase
    .from("rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("key", key)
    .gte("created_at", since);

  if ((count ?? 0) >= limit) return true;

  await supabase.from("rate_limits").insert({ key });
  // deliberately not awaited into the caller's critical path
  void sweep().catch(() => {});
  return false;
}

export function clientIp(req: Request): string {
  const f = req.headers.get("x-forwarded-for");
  return f ? f.split(",")[0].trim() : "unknown";
}