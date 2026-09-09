import { wedding } from "@/content/config";
import { googleCalendarUrl, neshanUrl } from "@/lib/calendar";
import { SectionHead, Rule } from "./ui";
import Reveal from "./Reveal";

export default function Ceremony() {
  return (
    <>
      <SectionHead
        id="ceremony-h"
        icon="📍"
        label="کجا کنار هم باشیم"
        title="مکان مراسم"
        className="mb-9"
      />

      <Reveal delay={0.05}>
        <div className="mx-auto max-w-[300px] text-center">
          <h3 className="nastaliq text-[22px] text-ink">{wedding.venue.name}</h3>
          <p className="mt-1 text-[13px] leading-[2] text-muted">
            {wedding.venue.address}
          </p>

          <Rule className="my-6" />

          <p className="text-[12.5px] tracking-[0.1em] text-umber">
            {wedding.weekdayFa} {wedding.dateFa}
          </p>
          <p className="mt-0.5 text-[12.5px] tracking-[0.1em] text-muted">
            {wedding.timeFa}
          </p>

          <div className="mt-8 flex flex-col gap-2.5">
            <a
              href={neshanUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-umber py-3.5 text-[12.5px] tracking-[0.06em] text-white transition hover:bg-ink"
            >
              مسیریابی با نشان
            </a>
            <a
              href="/invite.ics"
              className="rounded-full border border-taupe py-3.5 text-[12.5px] tracking-[0.06em] text-umber transition hover:bg-sunk"
            >
              افزودن به تقویم
            </a>
          </div>

          <a
            href={googleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-[11px] text-muted underline underline-offset-4 transition hover:text-ink"
          >
            یا افزودن به تقویم گوگل
          </a>
        </div>
      </Reveal>
    </>
  );
}
