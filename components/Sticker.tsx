import { STICKERS_READY, stickerById } from "@/content/stickers";

export default function Sticker({
  id,
  size = 24,
}: {
  id: string;
  size?: number;
}) {
  const s = stickerById(id);
  if (!s) return null;

  if (!STICKERS_READY)
    return (
      <span style={{ fontSize: size * 0.85, lineHeight: 1 }} aria-label={s.label}>
        {s.emoji}
      </span>
    );

  return (
    <img
      src={`/stickers/${s.id}.png`}
      alt={s.label}
      width={size}
      height={size}
      loading="lazy"
      className="inline-block select-none"
      draggable={false}
    />
  );
}