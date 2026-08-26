import { db } from "./supabase";

export type WallPost = {
  id: string;
  body: string | null;
  image_url: string | null;
  created_at: string;
  author: string;
};

export async function listPosts(limit = 50): Promise<WallPost[]> {
  const { data } = await db()
    .from("posts")
    .select("id, body, image_url, created_at, guests(name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((p) => {
    const g = Array.isArray(p.guests) ? p.guests[0] : p.guests;
    return {
      id: p.id as string,
      body: (p.body as string) ?? null,
      image_url: (p.image_url as string) ?? null,
      created_at: p.created_at as string,
      author: (g?.name as string) ?? "مهمان",
    };
  });
}