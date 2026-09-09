/** Flip to true once your six PNGs are in public/stickers/ */
export const STICKERS_READY = true;

export type Sticker = {
  id: string;
  label: string;
  emoji: string;
  /**
   * The master in design/stickers/, when it is not simply `<id>.png`. The
   * newer set arrived with numbered, spaced English filenames; renaming them
   * would lose the order the artist drew them in, so the id and the file are
   * allowed to differ and the pipeline reads this.
   */
  file?: string;
};

/**
 * The first six are the original set. They stay — and keep their ids — because
 * messages already on the wall reference them, and a sticker that stops
 * resolving is a message that turns into nothing.
 *
 * Reactions no longer use any of these: those are plain emoji now, so the
 * whole of this list is the sticker tray and nothing else.
 */
export const STICKERS: Sticker[] = [
  { id: "heart", label: "دوستتان داریم", emoji: "❤️" },
  { id: "laugh", label: "خنده", emoji: "😂" },
  { id: "tear", label: "اشک شوق", emoji: "🥹" },
  { id: "clap", label: "دست", emoji: "👏" },
  { id: "dance", label: "برقص", emoji: "💃" },
  { id: "toast", label: "نوش", emoji: "🥂" },

  { id: "honey", label: "عسل", emoji: "🍯", file: "01 — Honey on the finger.png" },
  { id: "mirror", label: "آینه", emoji: "🪞", file: "02 — The mirror moment.png" },
  { id: "money", label: "پول‌پاشی", emoji: "💸", file: "03 — Money shower.png" },
  { id: "fixing", label: "آراستن", emoji: "💐", file: "04 — Fixing each other up.png" },
  { id: "proposal", label: "خواستگاری", emoji: "💍", file: "05 — The proposal.png" },
  { id: "carried", label: "در آغوش", emoji: "🤍", file: "06 — Carried away.png" },
  { id: "confetti", label: "کاغذرنگی", emoji: "🎊", file: "07 — Confetti run.png" },
  { id: "cheers", label: "به سلامتی", emoji: "🥂", file: "08 — The toast.png" },
  { id: "cake", label: "بریدن کیک", emoji: "🎂", file: "09 — Cutting the cake.png" },
  { id: "feeding", label: "لقمه", emoji: "🍰", file: "10 — Feeding each other.png" },
  { id: "selfie", label: "سلفی", emoji: "🤳", file: "11 — The selfie.png" },
  { id: "buffet", label: "شام", emoji: "🍽️", file: "12 — Raiding the buffet.png" },
  { id: "barefoot", label: "نیمه‌شب", emoji: "🌙", file: "13 — Barefoot at midnight.png" },
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