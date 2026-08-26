import { db } from "./supabase";

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
  return false;
}

export function clientIp(req: Request): string {
  const f = req.headers.get("x-forwarded-for");
  return f ? f.split(",")[0].trim() : "unknown";
}