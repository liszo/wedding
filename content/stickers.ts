/** Flip to true once your six PNGs are in public/stickers/ */
export const STICKERS_READY = false;

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