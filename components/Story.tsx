import { story } from "@/content/story";
import { SectionHead } from "./ui";
import Reveal from "./Reveal";

/**
 * Three chapters, date and title only. The photographs are plain rectangles —
 * no arch, no dome, no mask; the crop does the work.
 *
 * The last chapter has no photograph and no text because it has not happened
 * yet. It is still loading.
 */
export default function Story() {
  return (
    <>
      <SectionHead id="story-h" title="قصه‌ی ما" className="mb-12" />

      <div className="mx-auto flex max-w-[300px] flex-col gap-14">
        {story.map((m) => (
          <Reveal key={m.title}>
            <div className="text-center">
              <p className="tabular text-[10px] tracking-[0.3em] text-muted">
                {m.when}
              </p>
              <h3 className="nastaliq mt-0.5 text-[22px] text-ink">
                {m.title}
              </h3>

              {m.photo ? (
                <img
                  src={m.photo.thumb}
                  srcSet={`${m.photo.thumb} ${m.photo.tw}w, ${m.photo.src} ${m.photo.w}w`}
                  sizes="(max-width: 26rem) 76vw, 300px"
                  width={m.photo.tw}
                  height={m.photo.th}
                  alt={m.photo.alt}
                  loading="lazy"
                  decoding="async"
                  className="mt-5 block aspect-4/5 w-full rounded-[6px] object-cover"
                />
              ) : (
                <div className="mt-6">
                  <div className="loading-bar" />
                  <p className="loading-dots mt-3 text-[12px] tracking-[0.2em] text-muted">
                    به‌زودی
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                  </p>
                </div>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </>
  );
}
