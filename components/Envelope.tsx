"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";
import { wedding, coupleNames } from "@/content/config";
import * as music from "@/lib/music";

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
      <div className="g-head">
        {guestName && <p className="label mb-4">{guestName} عزیز</p>}
        <p className="text-[12.5px] leading-[2] text-muted">
          شما دعوت شدید به مراسم عروسی
        </p>
        <p className="nastaliq mt-1 text-[32px] text-ink">{coupleNames}</p>
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
            <span className="nastaliq text-[23px] text-ink">{coupleNames}</span>
            <span className="text-[10px] tracking-[0.28em] text-muted">
              {wedding.dateFa}
            </span>
          </span>
          <span className="e-front" />
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
      </div>

      <p className="g-foot text-[11.5px] tracking-[0.16em] text-muted">
        برای گشودن، لمس کنید
      </p>
    </div>
  );
}
