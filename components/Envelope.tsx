"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";
import { wedding, coupleNames } from "@/content/config";
import * as music from "@/lib/music";
import { ORNAMENT, FLORAL } from "./ui";

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

/** Corner florals. Logical insets so the arrangement mirrors correctly in RTL. */
const CORNERS: (React.CSSProperties & { src: string })[] = [
  { src: FLORAL.corner, width: 150, top: -6, insetInlineStart: -18 },
  {
    src: FLORAL.eucalyptus,
    width: 172,
    top: -24,
    insetInlineEnd: -40,
    transform: "rotate(8deg)",
  },
  {
    src: FLORAL.peony,
    width: 150,
    bottom: -24,
    insetInlineStart: -32,
    transform: "rotate(188deg)",
  },
  {
    src: FLORAL.corner,
    width: 150,
    bottom: -6,
    insetInlineEnd: -18,
    transform: "rotate(180deg)",
  },
];

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
  const [going, setGoing] = useState(false);
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

    // let the flap and bloom play out before the layer is removed
    const wait = reduce ? 250 : 2350;
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
      className={`gate${going ? " go open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="دعوت‌نامه"
      onKeyDown={(e) => {
        if (e.key === "Escape") unseal();
      }}
    >
      {/* four florals crowding in from the corners; they fade before the bloom */}
      {CORNERS.map((c, i) => (
        <img
          key={i}
          className="g-fl"
          style={c}
          src={c.src}
          alt=""
          aria-hidden
        />
      ))}

      <div className="g-head">
        <div className="eyebrow">
          {guestName ? `${guestName} عزیز` : "دعوت‌نامه‌ی شما"}
        </div>
        <div className="nastaliq text-[36px] text-olive-ink">{coupleNames}</div>
        <img
          src={ORNAMENT.ruleBraid}
          alt=""
          aria-hidden
          className="mx-auto w-[170px] opacity-80"
        />
      </div>

      <div className="scene">
        <button
          ref={seal}
          className="env"
          onClick={unseal}
          aria-label="گشودن دعوت‌نامه"
        >
          <span className="e-back" />
          <span className="e-card">
            <img
              src={ORNAMENT.ampersand}
              alt=""
              aria-hidden
              className="w-[88px] opacity-90"
            />
            <span className="nastaliq text-[25px] text-olive-ink">
              {coupleNames}
            </span>
            <span className="text-[10.5px] tracking-[0.22em] text-gold-ink">
              {wedding.dateFa}
            </span>
          </span>
          <span className="e-front" />
          <span className="e-flap">
            <img
              src={ORNAMENT.ruleThin}
              alt=""
              aria-hidden
              className="h-fit w-24 opacity-40"
            />
          </span>
          <span className="seal-wax">
            <img
              src="/design/seals/wax-seal-olive-heart.webp"
              alt=""
              aria-hidden
              width={78}
              height={78}
              className="block w-full drop-shadow-[0_6px_14px_rgba(58,66,44,.4)]"
            />
          </span>
        </button>
      </div>

      <div className="g-foot text-[12.5px] tracking-[0.09em] text-muted">
        برای گشودن، مُهر را لمس کنید
      </div>
    </div>
  );
}
