/**
 * The whole vocabulary. Three pieces, no images.
 *
 * The previous directions divided sections with shaped seams and floral
 * cutouts. This one divides them with whitespace, a low-contrast ground
 * change, and one hairline — so everything here is CSS.
 */
import Reveal from "./Reveal";

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
  photo,
  className = "",
  id,
  labelledBy,
}: {
  children: React.ReactNode;
  tone?: Tone;
  /** a photograph behind the band, blurred and washed back */
  photo?: string;
  className?: string;
  id?: string;
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`band grain ${tone === "nude" ? "band-nude" : "band-white"} ${
        photo ? "band-on-photo overflow-hidden" : ""
      } ${className}`}
    >
      {photo ? (
        <>
          <div
            aria-hidden
            className="band-photo"
            style={{ backgroundImage: `url(${photo})` }}
          />
          <div aria-hidden className="band-photo-wash" />
          {/* the frosted plate the text stands on; see .band-plate */}
          <div className="band-plate">{children}</div>
        </>
      ) : (
        children
      )}
    </section>
  );
}

/**
 * label → nastaliq title → hairline. `label` is optional: the story section
 * runs without one.
 *
 * The reveal lives here rather than at the call sites: every section on the
 * page opens with one of these, so putting it inside is what makes the whole
 * page rise into view consistently.
 */
export function SectionHead({
  icon,
  label,
  title,
  id,
  className = "",
}: {
  /** One emoji, on a line of its own. Inside `.label` it would be set at
   *  9.5px with 0.42em of tracking, which renders it as an unreadable speck. */
  icon?: string;
  label?: string;
  title: string;
  id?: string;
  className?: string;
}) {
  return (
    <Reveal className={`text-center ${className}`}>
      {icon && (
        <p aria-hidden className="mb-2 text-[19px] leading-none">
          {icon}
        </p>
      )}
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
    </Reveal>
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
