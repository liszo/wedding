import { story } from "@/content/story";
import { SectionHead, Divider, ORNAMENT } from "./ui";
import Reveal from "./Reveal";

/**
 * Chapters alternate sides down the page. The photographs are arch-topped —
 * a 69px radius on a 138px-wide frame is a true semicircle — which echoes the
 * dome the section itself sits under.
 *
 * The last chapter has no photograph because it has not happened yet; it
 * centres instead, under the poppy arch.
 */
export default function Story() {
  return (
    <>
      <SectionHead
        id="story-h"
        eyebrow="از آغاز تا امروز"
        title="قصه‌ی ما"
        mark={ORNAMENT.crown}
        className="mt-6"
      />

      {story.map((m, i) => (
        <div key={m.title}>
          {i > 0 && <Divider width={180} />}

          <Reveal>
            {/* Below ~360px the side-by-side split leaves two words per line,
                so the chapter stacks and centres instead. */}
            {m.photo ? (
              <div
                className={`mx-auto flex max-w-[342px] flex-col items-center gap-4 text-center min-[360px]:items-center min-[360px]:gap-[18px] min-[360px]:text-start ${
                  i % 2 === 1
                    ? "min-[360px]:flex-row-reverse"
                    : "min-[360px]:flex-row"
                }`}
              >
                <div className="shrink-0 min-[360px]:basis-[132px]">
                  <img
                    src={m.photo.thumb}
                    width={m.photo.tw}
                    height={m.photo.th}
                    alt={m.photo.alt}
                    loading="lazy"
                    decoding="async"
                    className="block h-[180px] w-[132px] rounded-t-[66px] rounded-b-[5px] border border-gold-pale object-cover shadow-[0_12px_26px_-14px_rgba(70,64,44,.55)]"
                    style={{ filter: "sepia(.06) saturate(.93)" }}
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] tracking-[0.28em] text-gold-ink">
                    {m.when}
                  </p>
                  <h3 className="nastaliq my-px text-[21px] text-olive-ink">
                    {m.title}
                  </h3>
                  <p className="text-[13.5px] leading-[1.95] text-muted">
                    {m.body}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-[300px] text-center">
                <img
                  src={ORNAMENT.arch}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="mx-auto mb-1 w-[120px] opacity-85"
                />
                <p className="text-[10px] tracking-[0.28em] text-gold-ink">
                  {m.when}
                </p>
                <h3 className="nastaliq my-px text-[23px] text-olive-ink">
                  {m.title}
                </h3>
                <p className="text-[13.5px] leading-[1.95] text-muted">
                  {m.body}
                </p>
              </div>
            )}
          </Reveal>
        </div>
      ))}
    </>
  );
}
