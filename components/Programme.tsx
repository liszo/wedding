import { wedding } from "@/content/config";
import { SectionHead } from "./ui";
import Reveal from "./Reveal";

/**
 * Time and title, separated by hairlines. The gold pictograms are gone with
 * the rest of the ornament set — at this scale they were decoration, and the
 * times already carry the structure.
 */
export default function Programme() {
  return (
    <>
      <SectionHead
        id="programme-h"
        label="برنامه‌ی شب"
        title="ساعت به ساعت"
        className="mb-10"
      />

      <Reveal delay={0.05}>
        <ol className="mx-auto max-w-[292px]">
          {wedding.programme.map((step, i) => (
            <li
              key={step.at}
              className={`flex items-baseline gap-5 py-4 ${
                i === 0 ? "" : "border-t border-line"
              }`}
            >
              <span className="tabular w-[46px] shrink-0 text-[12px] tracking-[0.06em] text-muted">
                {step.at}
              </span>
              <span className="min-w-0 flex-1 text-[14px] text-ink">
                {step.title}
                {step.note && (
                  <em className="mt-0.5 block text-[11.5px] leading-[1.8] text-muted not-italic">
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
