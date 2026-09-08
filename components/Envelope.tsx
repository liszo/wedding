"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";
import { wedding, coupleNames } from "@/content/config";
import { photos } from "@/content/photos.generated";
import { ORNAMENT } from "@/components/ui";
import * as music from "@/lib/music";

/**
 * The only two florals the site serves, and both only here — they belong to
 * the envelope, never to the invitation. Two different sprays: one master used
 * twice, even mirrored, reads as a single butterfly rather than as flowers.
 * See the note in scripts/prepare-assets.ts.
 */
const FLORAL = {
  cascade: "/design/florals/rose-cascade.webp",
  peony: "/design/florals/peony-spray.webp",
} as const;

/**
 * The sealed invitation. Renders above the page, never instead of it — the
 * whole site is already in the DOM underneath, so no-JS visitors and crawlers
 * skip this entirely (app/layout.tsx hides the gates when scripting is off).
 *
 * It is sealed again on every load. Nothing about having opened it is
 * remembered: the envelope is the way in to the invitation, and a guest coming
 * back to their link should get the way in, not a page that starts halfway
 * through.
 *
 * All the choreography is CSS (see .gate in globals.css); this only flips
 * `go` (start the animation) and then `open` (fade the whole layer out).
 */
export default function Envelope({ guestName }: { guestName?: string }) {
  const [opened, setOpened] = useState(false);
  // The music question comes first; the envelope waits behind it so the two
  // overlays never stack or fight over focus.
  const musicChoice = useSyncExternalStore(
    music.subscribe,
    music.getChoice,
    music.getServerChoice
  );
  // Two states, not one. `go` starts the choreography; `open` fades the whole
  // layer out. They cannot be set together: the fade is 0.9s and the
  // choreography is 2.35s, so a single flag would dissolve the envelope while
  // the flap was still swinging and nobody would ever see the card come out.
  const [going, setGoing] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const seal = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  const waiting = musicChoice === null;

  // Hold the page still behind the closed gate, and move focus to the seal so
  // keyboard and screen-reader users land on the one control that matters.
  useEffect(() => {
    if (opened || waiting) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    seal.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [opened, waiting]);

  function unseal() {
    if (going) return;
    setGoing(true);

    // the bloom starts at 2s; the fade rides the back half of it
    window.setTimeout(() => setLeaving(true), reduce ? 100 : 2000);

    // let the flap and bloom play out before the layer is removed
    window.setTimeout(() => setOpened(true), reduce ? 350 : 2950);
  }

  if (opened || waiting) return null;

  return (
    <div
      data-gate
      className={`gate${going ? " go" : ""}${leaving ? " open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="دعوت‌نامه"
      onKeyDown={(e) => {
        if (e.key === "Escape") unseal();
      }}
    >
      {/* the ruled border and corner marks of a printed card */}
      <span aria-hidden className="g-frame">
        <i />
        <i />
        <i />
        <i />
      </span>

      <div className="g-head">
        {guestName && <p className="label mb-4">{guestName} عزیز</p>}
        <p className="text-[12.5px] leading-[2] text-muted">
          شما دعوت شدید به مراسم عروسی
        </p>
        <p className="nastaliq mt-1 text-[32px] text-ink">{coupleNames}</p>
        <img
          src={ORNAMENT.rule}
          alt=""
          aria-hidden
          width={118}
          height={14}
          className="mx-auto mt-3 w-[118px]"
        />
      </div>

      <div className="scene">
        {/* Two sprigs resting against the envelope, so the closed state is not
            a bare rectangle. This one is before the button in the DOM, which
            is what puts it behind the paper. */}
        <img
          src={FLORAL.cascade}
          alt=""
          aria-hidden
          className="e-sprig e-sprig-a"
        />

        <button
          ref={seal}
          className="env"
          onClick={unseal}
          aria-label="گشودن دعوت‌نامه"
        >
          {/* The pocket, back to front: the shell, the lining the flap
              uncovers, the flowers and the contents that rise out of it, then
              the pocket front with its three fold panels, then the flap. */}
          <span className="e-back" />
          <span className="e-liner" />

          <span className="e-bloom" aria-hidden>
            <img src={FLORAL.cascade} alt="" />
            <img src={FLORAL.peony} alt="" />
          </span>

          <span className="e-stack" aria-hidden>
            <img
              className="e-pic e-pic-a"
              src={photos.proposal.thumb}
              alt=""
              width={photos.proposal.tw}
              height={photos.proposal.th}
            />
            <img
              className="e-pic e-pic-b"
              src={photos.gallery1.thumb}
              alt=""
              width={photos.gallery1.tw}
              height={photos.gallery1.th}
            />
            <span className="e-note">
              <b>{wedding.weekdayFa}</b>
              <i>{wedding.dateFa}</i>
            </span>
          </span>

          <span className="e-front">
            <i className="p-l" />
            <i className="p-r" />
            <i className="p-b" />
          </span>

          <span className="e-flap" />

          {/* the highlight that crosses the paper; see .e-shine */}
          <span className="e-shine" aria-hidden />

          <span className="seal-mark">
            <img
              src="/design/seals/wax-heart.webp"
              alt=""
              aria-hidden
              width={62}
              height={63}
            />
          </span>
        </button>

        {/* and this one after it, lying over the corner of the envelope —
            the arrangement the reference uses */}
        <img
          src={FLORAL.cascade}
          alt=""
          aria-hidden
          className="e-sprig e-sprig-b"
        />
      </div>

      <p className="g-foot text-[11.5px] tracking-[0.16em] text-muted">
        <span aria-hidden className="g-tap" />
        برای گشودن، لمس کنید
      </p>
    </div>
  );
}
