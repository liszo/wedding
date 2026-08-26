import { db } from "./supabase";
import { KINDS, type Kind } from "./reactions";

export type WallComment = {
  id: string;
  author: string;
  body: string | null;
  sticker: string | null;
  created_at: string;
};

export type ReactionState = { kind: Kind; count: number; mine: boolean };

export type WallPost = {
  id: string;
  body: string | null;
  image_url: string | null;
  created_at: string;
  author: string;
  reactions: ReactionState[];
  comments: WallComment[];
};

function nameOf(g: unknown): string {
  const one = Array.isArray(g) ? g[0] : g;
  return (one as { name?: string })?.name ?? "مهمان";
}

export async function listPosts(
  meId: string | null,
  limit = 50
): Promise<WallPost[]> {
  const { data } = await db()
    .from("posts")
    .select(
      "id, body, image_url, created_at, guests(name), reactions(kind, guest_id), comments(id, body, sticker, created_at, guests(name))"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((p) => {
    const raw = (p.reactions ?? []) as { kind: string; guest_id: string }[];

    const reactions: ReactionState[] = KINDS.map((k) => {
      const forKind = raw.filter((r) => r.kind === k);
      return {
        kind: k,
        count: forKind.length,
        mine: meId ? forKind.some((r) => r.guest_id === meId) : false,
      };
    });

    const comments: WallComment[] = ((p.comments ?? []) as unknown[])
      .map((c) => {
        const row = c as {
          id: string;
          body: string | null;
          sticker: string | null;
          created_at: string;
          guests: unknown;
        };
        return {
          id: row.id,
          body: row.body ?? null,
          sticker: row.sticker ?? null,
          created_at: row.created_at,
          author: nameOf(row.guests),
        };
      })
      .sort((a, b) => a.created_at.localeCompare(b.created_at));

    return {
      id: p.id as string,
      body: (p.body as string) ?? null,
      image_url: (p.image_url as string) ?? null,
      created_at: p.created_at as string,
      author: nameOf(p.guests),
      reactions,
      comments,
    };
  });
}