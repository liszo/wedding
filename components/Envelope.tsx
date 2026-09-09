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
  /**
   * Three states, because the envelope now waits for the guest.
   *
   * `go`   the flap swings back and the photographs come out
   * `ready` the choreography has finished — the way in appears
   * `open` the scene blooms past the viewport and the layer leaves
   *
   * It used to run all of that on one timer, so the photographs were on screen
   * for well under a second before the whole thing dissolved itself. Nobody
   * had time to look at them. Now nothing dissolves until the guest says so.
   */
  const [going, setGoing] = useState(false);
  const [ready, setReady] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const gate = useRef<HTMLDivElement>(null);
  const enter = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  // move focus onto the way in as soon as it exists
  useEffect(() => {
    if (ready) enter.current?.focus();
  }, [ready]);

  const waiting = musicChoice === null;

  /**
   * Hold the page still behind the closed gate, and move focus into the
   * dialog so keyboard and screen-reader users land inside it.
   *
   * Focus goes to the dialog itself, not to the seal. Moving it onto the
   * button made Chrome treat the button as focus-visible — the click that
   * answered the music question counted as a keyboard-ish interaction — so a
   * ring flashed around the envelope and then vanished. The seal is still the
   * first thing Tab reaches, which is where a ring belongs.
   */
  useEffect(() => {
    if (opened || waiting) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    gate.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = prev;
    };
  }, [opened, waiting]);

  function unseal() {
    if (going) return;
    setGoing(true);
    // the flap, the flowers and the three prints all land by ~2.3s
    window.setTimeout(() => setReady(true), reduce ? 120 : 2300);
  }

  function go() {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(() => setOpened(true), reduce ? 250 : 1250);
  }

  if (opened || waiting) return null;

  return (
    <div
      ref={gate}
      tabIndex={-1}
      data-gate
      className={`gate${going ? " go" : ""}${ready ? " ready" : ""}${
        leaving ? " open" : ""
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="دعوت‌نامه"
      onKeyDown={(e) => {
        if (e.key !== "Escape") return;
        if (ready) go();
        else unseal();
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
        {/* The name is printed exactly as it stands in guests.csv. The list
            already carries its own endearments — «مامان جون», «عمو جلیل
            عزیزم» — so anything appended here lands on top of one. */}
        {guestName && <p className="g-name">{guestName}</p>}
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

          {/* Three prints, fanned. The tall one sits furthest back and rises
              highest, so all three read at once instead of stacking. */}
          <span className="e-stack" aria-hidden>
            <img
              className="e-pic e-pic-c"
              src={photos.envelope3.thumb}
              alt=""
              width={photos.envelope3.tw}
              height={photos.envelope3.th}
            />
            <img
              className="e-pic e-pic-a"
              src={photos.envelope1.thumb}
              alt=""
              width={photos.envelope1.tw}
              height={photos.envelope1.th}
            />
            <img
              className="e-pic e-pic-b"
              src={photos.envelope2.thumb}
              alt=""
              width={photos.envelope2.tw}
              height={photos.envelope2.th}
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

      <div className="g-foot">
        {ready ? (
          <button ref={enter} onClick={go} className="g-enter">
            ورود به دعوت‌نامه
          </button>
        ) : (
          <p className="text-[11.5px] tracking-[0.16em] text-muted">
            <span aria-hidden className="g-tap" />
            برای گشودن، لمس کنید
          </p>
        )}
      </div>
    </div>
  );
}
