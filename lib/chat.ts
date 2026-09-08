import type { WallPost, ReactionState } from "./posts";
import { stickerIdFromUrl } from "@/content/stickers";
import { toFa, pad2 } from "./fa";

/**
 * The wall is a conversation, so it is one flat list in the order things were
 * said — not a feed of posts each with a thread hanging off it.
 *
 * A reply is a message like any other; it just carries a quote of what it
 * answers, the way Telegram and WhatsApp show one. That is why comments are
 * lifted out of their parent here and dropped into the same timeline by their
 * own timestamp: nested, they read as an article's comment section, which is
 * the thing this page was asked to stop being.
 */
export type ChatItem = {
  id: string;
  at: string;
  author: string;
  mine: boolean;
  body: string | null;
  /** a photograph, when the message carries one */
  photo: string | null;
  /** a sticker id, when the whole message is a sticker */
  sticker: string | null;
  /** replies cannot be reacted to or replied to; only top-level messages can */
  postId: string | null;
  reactions: ReactionState[];
  quote: { author: string; text: string } | null;
};

/** What a quoted message shows when there is no text to quote. */
function preview(post: WallPost): string {
  if (post.body) return post.body;
  if (stickerIdFromUrl(post.image_url)) return "استیکر";
  if (post.image_url) return "عکس";
  return "پیام";
}

export function buildTimeline(posts: WallPost[]): ChatItem[] {
  const items: ChatItem[] = [];

  for (const p of posts) {
    const sticker = stickerIdFromUrl(p.image_url);
    items.push({
      id: p.id,
      at: p.created_at,
      author: p.author,
      mine: p.mine,
      body: p.body,
      photo: sticker ? null : p.image_url,
      sticker,
      postId: p.id,
      reactions: p.reactions,
      quote: null,
    });

    for (const c of p.comments) {
      items.push({
        id: c.id,
        at: c.created_at,
        author: c.author,
        mine: c.mine,
        body: c.body,
        photo: null,
        sticker: c.sticker,
        postId: null,
        reactions: [],
        quote: { author: p.author, text: preview(p) },
      });
    }
  }

  return items.sort((a, b) => a.at.localeCompare(b.at));
}

/* --- the day rules ------------------------------------------------------- */

const dayFmt = new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-arabext", {
  day: "numeric",
  month: "long",
  timeZone: "Asia/Tehran",
});

/** Tehran's calendar day for an instant, as a sortable key. */
const keyFmt = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Tehran",
});

export function dayKey(iso: string): string {
  return keyFmt.format(new Date(iso));
}

/**
 * The separator between days. "امروز" and "دیروز" are computed against
 * Tehran's day, not the reader's — the wedding has one timezone and a guest
 * abroad should see the same divisions everyone else does.
 */
export function dayLabel(iso: string): string {
  const k = dayKey(iso);
  const now = Date.now();
  if (k === keyFmt.format(new Date(now))) return "امروز";
  if (k === keyFmt.format(new Date(now - 86_400_000))) return "دیروز";
  return dayFmt.format(new Date(iso));
}

const timeFmt = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Tehran",
});

export function clockFa(iso: string): string {
  return toFa(timeFmt.format(new Date(iso)));
}

/* --- avatars -------------------------------------------------------------- */

/**
 * Six muted tones — enough that a room of guests is legible at a glance,
 * all of them inside the palette so the page does not turn into a toybox.
 */
const TONES = [
  "#8c7f70",
  "#9b8574",
  "#7f8478",
  "#a08a86",
  "#88807a",
  "#94856a",
] as const;

export function avatarTone(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return TONES[h % TONES.length];
}

export function initial(name: string): string {
  return [...name.trim()][0] ?? "؟";
}

export { toFa, pad2 };
