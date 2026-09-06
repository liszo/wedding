import { wedding } from "@/content/config";
import { SectionHead, ORNAMENT } from "./ui";
import Reveal from "./Reveal";

/**
 * The five programme pictograms have wildly different aspect ratios
 * (110x40 through 90x237), so each gets the same 40px circle and
 * object-contain — see design/ASSETS.md, icons/.
 */
const ICONS: Record<string, string> = {
  flower: "/design/icons/flower-gold.webp",
  rings: "/design/icons/rings-gold.webp",
  rose: "/design/icons/rose-stem-gold.webp",
  champagne: "/design/icons/champagne-glasses-gold.webp",
  heart: "/design/icons/heart-arrow-gold.webp",
};

export default function Programme() {
  return (
    <>
      <SectionHead
        id="programme-h"
        eyebrow="آنچه برایتان آماده کرده‌ایم"
        title="برنامه‌ی شب"
        mark={ORNAMENT.crown}
        under={ORNAMENT.ruleThin}
        className="mt-4"
      />

      <Reveal>
        <ol className="mx-auto max-w-[322px]">
          {wedding.programme.map((step, i) => (
            <li
              key={step.at}
              className={`flex items-center gap-[13px] py-[15px] ${
                i === wedding.programme.length - 1
                  ? ""
                  : "border-b border-gold-pale"
              }`}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold-pale">
                <img
                  src={ICONS[step.icon]}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  decoding="async"
                  className="max-h-5 max-w-5 object-contain"
                />
              </span>

              <span className="tabular shrink-0 basis-[54px] text-[12.5px] tracking-[0.05em] text-gold-ink">
                {step.at}
              </span>

              <span className="min-w-0 text-[14.5px] text-ink">
                {step.title}
                {step.note && (
                  <em className="block text-[12px] leading-[1.7] text-muted not-italic">
                    {step.note}
                  </em>
                )}
              </span>
            </li>
          ))}
        </ol>
      </Reveal>
    </>
  );
}
