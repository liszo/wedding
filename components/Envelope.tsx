"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";
import { wedding, coupleNames } from "@/content/config";
import { photos } from "@/content/photos.generated";
import { ORNAMENT } from "@/components/ui";
import * as music from "@/lib/music";

/**
 * The only two florals the site serves, and both only here — an envelope's
 * lining is inside it, so they never touch the invitation. See the note in
 * scripts/prepare-assets.ts.
 */
const FLORAL = {
  sheet: "/design/florals/rose-sheet.webp",
  cascade: "/design/florals/rose-cascade.webp",
} as const;

const SEEN = "wg-envelope-opened";

/* Whether the seal has been broken lives in sessionStorage, which is an
   external store — reading it in an effect and calling setState would cost a
   cascading render and flash the envelope at someone who already opened it. */
const listeners = new Set<() => void>();
/** Fallback for when storage throws, so the seal still opens exactly once. */
let openedInMemory = false;

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}

function isOpened(): boolean {
  if (openedInMemory) return true;
  try {
    return sessionStorage.getItem(SEEN) === "1";
  } catch {
    // private mode or storage blocked — show the envelope, it still works
    return false;
  }
}

/** On the server, assume opened: the gate is a client-only flourish. */
function openedOnServer() {
  return true;
}

/**
 * The sealed invitation. Renders above the page, never instead of it — the
 * whole site is already in the DOM underneath, so no-JS visitors and crawlers
 * skip this entirely.
 *
 * All the choreography is CSS (see .gate in globals.css); this only flips
 * `go` (start the animation) and then `open` (fade the whole layer out).
 */
export default function Envelope({ guestName }: { guestName?: string }) {
  const opened = useSyncExternalStore(subscribe, isOpened, openedOnServer);
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
    const wait = reduce ? 350 : 2950;
    window.setTimeout(() => {
      openedInMemory = true;
      try {
        sessionStorage.setItem(SEEN, "1");
      } catch {
        // ignore — worst case the gate shows again on the next navigation
      }
      for (const fn of listeners) fn();
    }, wait);
  }

  if (opened || waiting) return null;

  return (
    <div
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
          <span
            className="e-liner"
            style={{ backgroundImage: `url(${FLORAL.sheet})` }}
          />

          <span className="e-bloom" aria-hidden>
            <img src={FLORAL.cascade} alt="" />
            <img src={FLORAL.cascade} alt="" />
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
