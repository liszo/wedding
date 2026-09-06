/**
 * The section-division vocabulary. Every seam between two bands on this page is
 * one of these three shapes, and most carry a floral over the join.
 *
 *   <Band tone="olive">          a flat colour change
 *   <Band tone="paper" dome>     the band swells up over the one above
 *   <Scallop from="paper" />     a lace edge of the band above, hanging down
 *   <Seam src=... />             a floral straddling the join
 *
 * Only design/florals and design/ornaments are used — the Persian illumination
 * set belongs to a different register and will fight these (ASSETS.md rule 9).
 */

const A = "/design";

export const ORNAMENT = {
  wreath: `${A}/ornaments/wreath-eucalyptus-gold.webp`,
  crown: `${A}/ornaments/crown-lily-gold.webp`,
  arch: `${A}/ornaments/arch-poppy-gold.webp`,
  ampersand: `${A}/ornaments/ampersand-leaves-gold.webp`,
  sprig: `${A}/ornaments/sprig-olive-branch-gold.webp`,
  corner: `${A}/ornaments/corner-leaf-vertical-gold.webp`,
  ruleThin: `${A}/ornaments/divider-leaf-thin-gold.webp`,
  ruleBraid: `${A}/ornaments/divider-braid-heart-gold.webp`,
  ruleFloral: `${A}/ornaments/divider-floral-symmetric-gold.webp`,
  ruleWide: `${A}/ornaments/divider-leaf-heart-wide-gold.webp`,
  lace: `${A}/ornaments/lace-scallop-fine-gold.webp`,
} as const;

/** Programme pictograms, also usable as small emblems. */
export const ICON = {
  rings: `${A}/icons/rings-gold.webp`,
  flower: `${A}/icons/flower-gold.webp`,
  rose: `${A}/icons/rose-stem-gold.webp`,
  champagne: `${A}/icons/champagne-glasses-gold.webp`,
  heart: `${A}/icons/heart-arrow-gold.webp`,
} as const;

export const FLORAL = {
  cascade: `${A}/florals/rose-cascade.webp`,
  peony: `${A}/florals/peony-spray.webp`,
  corner: `${A}/florals/rose-spray-corner.webp`,
  eucalyptus: `${A}/florals/eucalyptus-watercolour.webp`,
  branch: `${A}/florals/eucalyptus-branch.webp`,
  calla: `${A}/florals/calla-lilies.webp`,
  arch: `${A}/florals/floral-arch-white.webp`,
} as const;

type Tone = "paper" | "olive";

export function Band({
  children,
  tone = "paper",
  dome,
  className = "",
  id,
  labelledBy,
}: {
  children: React.ReactNode;
  tone?: Tone;
  /** false | true (78px crest) | "sm" (52px crest) */
  dome?: boolean | "sm";
  className?: string;
  id?: string;
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={[
        "band grain",
        tone === "olive" ? "band-olive" : "band-paper",
        dome === "sm" ? "dome-sm" : dome ? "dome" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </section>
  );
}

const TONE_VAR: Record<Tone, string> = {
  paper: "var(--paper)",
  olive: "var(--olive)",
};

/** twelve half-circles across the 430-unit frame */
const SCALLOPS = 12;
const STEP = 430 / SCALLOPS;
const WAVE = `M0 9 ${`q${STEP / 2} 22 ${STEP} 0 `.repeat(SCALLOPS)}`;

/**
 * A scalloped hem. Four layers, because a single wave reads as a divider
 * floating between two sections rather than as the edge of the one above:
 *
 *   1. the band BELOW, painted as this strip's own background — without it the
 *      transparent parts of the SVG show `.frame`'s paper and the scallops are
 *      simply invisible on a paper-to-olive join
 *   2. the wave itself, filled with the band ABOVE
 *   3. a gold hairline tracing the wave
 *   4. a pearl at the low point of every scallop, and the tiling gold lace
 *      strip riding just above the crests
 */
export function Scallop({
  from = "paper",
  to = "olive",
  lace = true,
}: {
  from?: Tone;
  to?: Tone;
  lace?: boolean;
}) {
  const above = TONE_VAR[from];
  const gold = to === "olive" ? "var(--gold-lite)" : "var(--gold)";

  return (
    <div
      aria-hidden
      className="relative z-3 -mb-px h-[34px] leading-[0]"
      style={{ background: TONE_VAR[to] }}
    >
      {lace && (
        <div
          className={`absolute inset-x-0 -top-[14px] z-2 h-[16px] ${
            from === "olive" ? "lift-always" : ""
          }`}
          style={{
            background: `url("${ORNAMENT.lace}") repeat-x center / auto 16px`,
            opacity: 0.85,
          }}
        />
      )}

      <svg
        viewBox="0 0 430 34"
        preserveAspectRatio="none"
        className="block h-[34px] w-full"
      >
        <path d={`${WAVE}V0 H0 Z`} fill={above} />
        <path
          d={WAVE}
          fill="none"
          stroke={gold}
          strokeWidth="1"
          opacity="0.75"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Pearls sit in their own absolutely-positioned row rather than inside
          the SVG: preserveAspectRatio="none" stretches the viewBox to the
          frame width, which would squash circles into ellipses. */}
      <div className="pointer-events-none absolute inset-x-0 top-[21px] flex justify-around px-[8px]">
        {Array.from({ length: SCALLOPS }, (_, i) => (
          <span
            key={i}
            className="block h-[3px] w-[3px] rounded-full"
            style={{ background: gold, opacity: 0.65 }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * A floral cutout pinned across a seam. `at` positions it; the defaults put it
 * centred on the crest of a dome.
 */
export function Seam({
  src,
  width,
  className = "",
  style,
}: {
  src: string;
  width: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      loading="lazy"
      decoding="async"
      className={`seam ${className}`}
      style={{ width, ...style }}
    />
  );
}

/**
 * eyebrow → ornament → nastaliq title → divider. Every section opens with one,
 * which is most of what makes the page feel like a single document.
 */
export function SectionHead({
  eyebrow,
  title,
  id,
  mark = ORNAMENT.crown,
  under = ORNAMENT.ruleThin,
  tone = "paper",
  className = "",
}: {
  eyebrow: string;
  title: string;
  id?: string;
  mark?: string | null;
  under?: string | null;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div className={`mb-8 text-center ${className}`}>
      {mark && (
        <img
          src={mark}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className={`mx-auto mb-1 w-[92px] opacity-90 ${
            tone === "olive" ? "lift-always" : ""
          }`}
        />
      )}
      <div className="eyebrow">{eyebrow}</div>
      <h2
        id={id}
        className={`nastaliq mt-0.5 text-[28px] ${
          tone === "olive" ? "text-[#F6F3E7]" : "text-olive-ink"
        }`}
      >
        {title}
      </h2>
      {under && (
        <img
          src={under}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className={`mx-auto mt-1.5 w-[150px] opacity-85 ${
            tone === "olive" ? "lift-always" : ""
          }`}
        />
      )}
    </div>
  );
}

/** A standalone gold rule between two blocks of the same section. */
export function Divider({
  src = ORNAMENT.ruleBraid,
  width = 180,
  tone = "paper",
  className = "",
}: {
  src?: string;
  width?: number;
  tone?: Tone;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      loading="lazy"
      decoding="async"
      style={{ width }}
      className={`mx-auto my-5 block opacity-80 ${
        tone === "olive" ? "lift-always" : ""
      } ${className}`}
    />
  );
}
