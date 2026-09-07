/**
 * The whole vocabulary. Three pieces, no images.
 *
 * The previous directions divided sections with shaped seams and floral
 * cutouts. This one divides them with whitespace, a low-contrast ground
 * change, and one hairline — so everything here is CSS.
 */

/**
 * The only two ornaments the site serves, re-tinted from their gold masters to
 * the nude palette at build time (scripts/prepare-assets.ts). Used sparingly:
 * one rule under a section heading, one mark in the footer. Everything else is
 * still drawn in CSS.
 */
export const ORNAMENT = {
  rule: "/design/ornaments/divider-braid-heart.webp",
  crown: "/design/ornaments/crown-lily.webp",
} as const;

type Tone = "white" | "nude";

export function Band({
  children,
  tone = "white",
  className = "",
  id,
  labelledBy,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
  id?: string;
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`band grain ${tone === "nude" ? "band-nude" : "band-white"} ${className}`}
    >
      {children}
    </section>
  );
}

/**
 * label → nastaliq title → hairline. `label` is optional: the story section
 * runs without one.
 */
export function SectionHead({
  label,
  title,
  id,
  className = "",
}: {
  label?: string;
  title: string;
  id?: string;
  className?: string;
}) {
  return (
    <div className={`text-center ${className}`}>
      {label && <p className="label">{label}</p>}
      <h2 id={id} className="nastaliq mt-1 text-[27px] text-ink">
        {title}
      </h2>
      {/* the one place an ornament earns its keep */}
      <img
        src={ORNAMENT.rule}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        className="mx-auto mt-3 w-[132px]"
      />
    </div>
  );
}

/** A short centred hairline, between blocks of the same section. */
export function Rule({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`rule ${className}`} />;
}

/**
 * The division between two bands: a broken hairline with a small diamond in
 * the gap. It carries the ground of the band it follows, so the colour change
 * happens cleanly below it rather than through it.
 */
export function Seam({ tone = "white" }: { tone?: Tone }) {
  return (
    <div
      aria-hidden
      className={`py-1 ${tone === "nude" ? "band-nude" : "band-white"}`}
    >
      <div className="seam">
        <i />
      </div>
    </div>
  );
}
