export const KINDS = ["heart", "laugh", "tear", "clap"] as const;
export type Kind = (typeof KINDS)[number];

export function isKind(v: unknown): v is Kind {
  return typeof v === "string" && (KINDS as readonly string[]).includes(v);
}

/**
 * Reactions are plain emoji. They used to be drawn with the couple's own
 * stickers, which left nothing to tell a reaction and a sticker message apart —
 * the illustrations belong to the sticker tray, and a reaction wants to be a
 * small, instantly readable mark.
 *
 * The four ids are unchanged on purpose: they are stored as strings in the
 * `reactions` table, so renaming any of them would orphan every reaction
 * already left on the wall. Only what they are drawn as has changed.
 */
export const REACTION: Record<Kind, { emoji: string; label: string }> = {
  heart: { emoji: "❤️", label: "قشنگه" },
  laugh: { emoji: "😍", label: "عاشقشم" },
  tear: { emoji: "🥹", label: "اشک شوق" },
  clap: { emoji: "🎉", label: "مبارکه" },
};
