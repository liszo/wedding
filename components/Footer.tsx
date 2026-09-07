import { wedding, coupleNames } from "@/content/config";
import { ORNAMENT } from "./ui";
import Reveal from "./Reveal";

/** The closing plate: initials, names, date. Nothing else. */
export default function Footer() {
  return (
    <footer className="band grain band-nude text-center">
      <Reveal>
        <div className="mx-auto max-w-[260px]">
          <img
            src={ORNAMENT.crown}
            alt=""
            aria-hidden
            className="mx-auto mb-6 w-[86px]"
          />

          <p className="nastaliq text-[28px] leading-[1.9] text-ink">
            {coupleNames}
          </p>

          <img
            src={ORNAMENT.rule}
            alt=""
            aria-hidden
            className="mx-auto my-4 w-[116px]"
          />

          <p className="text-[11.5px] tracking-[0.16em] text-muted">
            {wedding.weekdayFa} {wedding.dateFa}
          </p>
          <p className="mt-0.5 text-[11.5px] text-muted">
            {wedding.venue.name}
          </p>
        </div>
      </Reveal>
    </footer>
  );
}
