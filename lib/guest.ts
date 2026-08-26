import { cookies } from "next/headers";
import { db } from "./supabase";
import { readSessionValue, SESSION_COOKIE } from "./session";

export type Guest = { id: string; name: string };

export async function getGuest(): Promise<Guest | null> {
  const store = await cookies();
  const id = readSessionValue(store.get(SESSION_COOKIE)?.value);
  if (!id) return null;

  const { data } = await db()
    .from("guests")
    .select("id, name")
    .eq("id", id)
    .single();

  return data ?? null;
}