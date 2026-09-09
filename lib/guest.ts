import { cookies } from "next/headers";
import { db } from "./supabase";
import { readSessionValue, SESSION_COOKIE } from "./session";

export type Guest = {
  id: string;
  /** the greeting on the envelope — printed exactly as it stands in the list */
  name: string;
  /** what sits above their messages on the wall; falls back to `name` */
  display_name: string | null;
  /** the couple: may delete anything on the wall */
  host: boolean;
};

export async function getGuest(): Promise<Guest | null> {
  const store = await cookies();
  const id = readSessionValue(store.get(SESSION_COOKIE)?.value);
  if (!id) return null;

  const { data } = await db()
    .from("guests")
    .select("id, name, display_name, host")
    .eq("id", id)
    .single();

  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    display_name: data.display_name ?? null,
    host: Boolean(data.host),
  };
}