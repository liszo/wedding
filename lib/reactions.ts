export const KINDS = ["heart", "laugh", "tear", "clap"] as const;
export type Kind = (typeof KINDS)[number];

export const GLYPH: Record<Kind, string> = {
  heart: "❤️",
  laugh: "😂",
  tear: "🥹",
  clap: "👏",
};

export function isKind(v: unknown): v is Kind {
  return typeof v === "string" && (KINDS as readonly string[]).includes(v);
}