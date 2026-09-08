/** Flip to true once your six PNGs are in public/stickers/ */
export const STICKERS_READY = true;

export type Sticker = {
  id: string;
  label: string;
  emoji: string;
};

export const STICKERS: Sticker[] = [
  { id: "heart", label: "دوستتان داریم", emoji: "❤️" },
  { id: "laugh", label: "خنده", emoji: "😂" },
  { id: "tear", label: "اشک شوق", emoji: "🥹" },
  { id: "clap", label: "دست", emoji: "👏" },
  { id: "dance", label: "برقص", emoji: "💃" },
  { id: "toast", label: "نوش", emoji: "🥂" },
];

export const STICKER_IDS = STICKERS.map((s) => s.id);

export function isSticker(v: unknown): v is string {
  return typeof v === "string" && STICKER_IDS.includes(v);
}

export function stickerById(id: string): Sticker | undefined {
  return STICKERS.find((s) => s.id === id);
}

/**
 * A sticker sent as a message of its own rides in `posts.image_url`.
 *
 * A sticker *is* an image, and that column already holds the URL of one — so a
 * sticker message needs no new column and no migration on a table that is
 * already carrying real guests' posts. The prefix is what tells the two apart:
 * every uploaded photo is an absolute Supabase storage URL, and only stickers
 * are served from this path.
 */
const STICKER_PREFIX = "/stickers/";

export function stickerUrl(id: string): string {
  return `${STICKER_PREFIX}${id}.webp`;
}

export function stickerIdFromUrl(url: string | null): string | null {
  if (!url || !url.startsWith(STICKER_PREFIX)) return null;
  const id = url.slice(STICKER_PREFIX.length).replace(/\.webp$/, "");
  return isSticker(id) ? id : null;
}