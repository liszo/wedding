import { db } from "./supabase";

export type MyRsvp = {
  attending: boolean;
  party_size: number;
  note: string | null;
} | null;

export async function getMyRsvp(guestId: string): Promise<MyRsvp> {
  const { data } = await db()
    .from("rsvps")
    .select("attending, party_size, note")
    .eq("guest_id", guestId)
    .maybeSingle();
  return data ?? null;
}