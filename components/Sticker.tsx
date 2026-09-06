import { STICKERS_READY, stickerById } from "@/content/stickers";

/**
 * Two rasters per sticker, both WebP: `-s` for the 18-30px inline uses and the
 * full one for the 56px comment sticker. Picking by size keeps a reaction chip
 * from downloading the large asset.
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
      src={`/stickers/${s.id}${size <= 32 ? "-s" : ""}.webp`}
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
