import { wedding, coupleNames } from "@/content/config";
import { ORNAMENT, FLORAL } from "./ui";
import Reveal from "./Reveal";

/**
 * The closing plate. Where every other olive band is a list or a grid, this one
 * is a single centred object: a double-ruled gold frame with the monogram
 * notched into its top edge, the names inside, and florals crowding the corners
 * from outside the rule so the frame reads as an object laid on the page.
 */
export default function Footer() {
  return (
    <footer className="band grain band-olive relative overflow-hidden !px-6 !pt-16 !pb-20 text-center">
      {/* Corner florals, outside the frame and half-cropped by the band edge.
          White roses rather than eucalyptus — the same cream-on-olive reading
          as the venue arch, where the greenery just went muddy. */}
      <img
        src={FLORAL.cascade}
        alt=""
        aria-hidden
        loading="lazy"
        className="pointer-events-none absolute -top-10 w-[122px] opacity-90"
        style={{ insetInlineStart: -30, transform: "rotate(-8deg)" }}
      />
      <img
        src={FLORAL.corner}
        alt=""
        aria-hidden
        loading="lazy"
        className="pointer-events-none absolute -bottom-8 w-[116px] opacity-85"
        style={{ insetInlineEnd: -26, transform: "rotate(184deg)" }}
      />

      <Reveal>
        <div className="relative mx-auto max-w-[300px]">
          {/* The crown sits above the frame, not notched into it. Notching
              needs an opaque plate, and a plate over a grained band always
              shows as a lighter rectangle. */}
          <img
            src={ORNAMENT.crown}
            alt=""
            aria-hidden
            className="lift-always mx-auto mb-3 w-[92px] opacity-90"
          />

          {/* outer rule */}
          <div className="relative rounded-[20px] border border-gold-lite/45 px-7 pt-9 pb-8">
            {/* inner rule */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-[7px] rounded-[14px] border border-gold-lite/25"
            />

            <p className="nastaliq text-[32px] leading-[1.9] text-[#F6F3E7]">
              {coupleNames}
            </p>

            <img
              src={ORNAMENT.ruleBraid}
              alt=""
              aria-hidden
              className="lift-always mx-auto my-3 w-[128px] opacity-80"
            />

            <p className="text-[12px] leading-[2] text-gold-lite">
              {wedding.weekdayFa} {wedding.dateFa}
            </p>
            <p className="text-[12px] text-on-olive-soft">
              {wedding.venue.name}
            </p>
          </div>

          <p className="nastaliq mt-7 text-[20px] text-gold-lite">
            منتظر دیدنت هستیم
          </p>
        </div>
      </Reveal>
    </footer>
  );
}
