import { STICKERS_READY, stickerById } from "@/content/stickers";

/**
 * Two rasters per sticker, both WebP: `-s` for the small inline uses and the
 * full one for a sticker sent as a message. Picking by size keeps a tray
 * thumbnail from pulling down the large asset.
 */
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
      <span
        style={{ fontSize: size * 0.85, lineHeight: 1 }}
        role="img"
        aria-label={s.label}
      >
        {s.emoji}
      </span>
    );

  return (
    <img
      src={`/stickers/${s.id}${size <= 34 ? "-s" : ""}.webp`}
      alt={s.label}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className="inline-block select-none"
      draggable={false}
    />
  );
}
