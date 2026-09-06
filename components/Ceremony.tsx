import { wedding } from "@/content/config";
import { googleCalendarUrl, neshanUrl } from "@/lib/calendar";
import { SectionHead, FLORAL, ORNAMENT } from "./ui";
import Reveal from "./Reveal";

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-3.5 w-3.5 shrink-0 fill-none stroke-current stroke-[1.2]"
    >
      <rect x="3" y="5" width="18" height="16" rx="1" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-3.5 w-3.5 shrink-0 fill-none stroke-current stroke-[1.2]"
    >
      <path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3z" />
      <path d="M9 3v15M15 6v15" />
    </svg>
  );
}

/**
 * Sits on an olive band. The venue illustration is a white floral arch on a
 * transparent ground, which is exactly why it lives here rather than on paper
 * — the white reads as light against the dark green instead of disappearing.
 */
export default function Ceremony() {
  return (
    <>
      <SectionHead
        id="ceremony-h"
        eyebrow="کجا کنار هم باشیم"
        title="مکان مراسم"
        mark={ORNAMENT.ruleWide}
        under={null}
        tone="olive"
        className="mb-4"
      />

      <Reveal>
        <div className="text-center">
          <img
            src={FLORAL.arch}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="mx-auto mb-3 block w-full max-w-[264px]"
          />

          <h3 className="nastaliq text-[23px] text-[#F6F3E7]">
            {wedding.venue.name}
          </h3>
          <p className="text-[13.5px] leading-[1.9] text-on-olive-soft">
            {wedding.venue.address}
          </p>
          <p className="mt-2 text-[12.5px] tracking-[0.12em] text-gold-lite">
            {wedding.weekdayFa} {wedding.dateFa} — {wedding.timeFa}
          </p>

          <div className="mx-auto mt-6 flex max-w-[330px] gap-2.5">
            <a
              href="/invite.ics"
              className="flex flex-1 items-center justify-center gap-[7px] rounded-xl border border-paper bg-paper px-2 py-3.5 text-[12.5px] text-olive-ink transition hover:bg-paper-lite"
            >
              <CalendarIcon />
              افزودن به تقویم
            </a>
            <a
              href={neshanUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-[7px] rounded-xl border border-gold-lite/55 px-2 py-3.5 text-[12.5px] text-on-olive transition hover:bg-paper/10"
            >
              <MapIcon />
              مسیریابی
            </a>
          </div>

          <a
            href={googleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3.5 inline-block text-[11px] text-on-olive-soft underline underline-offset-4 transition hover:text-gold-lite"
          >
            یا افزودن به تقویم گوگل
          </a>
        </div>
      </Reveal>
    </>
  );
}
