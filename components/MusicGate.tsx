"use client";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { choose, getChoice, getServerChoice, subscribe } from "@/lib/music";
import { ORNAMENT, FLORAL } from "./ui";

/**
 * The first thing a guest sees, before the sealed envelope. Asking up front is
 * the only honest way to handle a soundtrack: browsers will not autoplay
 * anyway, and starting audio the moment someone opens a link is rude.
 *
 * Answering "yes" begins playback inside this click handler, so by the time
 * the envelope appears the music is already under it.
 */
export default function MusicGate() {
  const choice = useSyncExternalStore(subscribe, getChoice, getServerChoice);
  const yesBtn = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (choice !== null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    yesBtn.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [choice]);

  return (
    <AnimatePresence>
      {choice === null && (
        <motion.div
          key="music-gate"
          role="dialog"
          aria-modal="true"
          aria-labelledby="music-gate-h"
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.15 : 0.5 }}
          onKeyDown={(e) => {
            if (e.key === "Escape") choose("no");
          }}
          className="fixed inset-0 z-110 flex items-center justify-center bg-paper px-7"
        >
          {/* the page grain does not reach a fixed overlay — repaint it */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50 mix-blend-multiply"
            style={{
              background:
                "url('/design/texture/paper-seamless.jpg') repeat 0 0 / 170px 170px",
            }}
          />
          <img
            src={FLORAL.eucalyptus}
            alt=""
            aria-hidden
            className="pointer-events-none absolute w-[150px] opacity-70"
            style={{ top: -22, insetInlineStart: -36, transform: "rotate(6deg)" }}
          />
          <img
            src={FLORAL.peony}
            alt=""
            aria-hidden
            className="pointer-events-none absolute w-[140px] opacity-70"
            style={{
              bottom: -18,
              insetInlineEnd: -30,
              transform: "rotate(184deg)",
            }}
          />

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[320px] rounded-[20px] border border-gold-pale bg-paper-lite/80 px-7 py-9 text-center shadow-[0_20px_50px_-28px_rgba(43,48,37,.55)]"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-[7px] rounded-[14px] border border-gold/25"
            />

            <img
              src={ORNAMENT.crown}
              alt=""
              aria-hidden
              className="mx-auto mb-2 w-[76px] opacity-90"
            />

            <h2
              id="music-gate-h"
              className="nastaliq text-[23px] text-olive-ink"
            >
              با موسیقی؟
            </h2>
            <p className="mx-auto mt-1 mb-7 max-w-[220px] text-[12.5px] leading-[1.9] text-muted">
              یک قطعه‌ی آرام همراه دعوت‌نامه پخش می‌شود. هر وقت خواستی می‌توانی
              خاموشش کنی.
            </p>

            <div className="flex gap-2.5">
              <button
                ref={yesBtn}
                onClick={() => choose("yes")}
                className="flex-1 rounded-xl border border-olive bg-olive py-3 text-[12.5px] text-paper transition hover:bg-olive-deep"
              >
                بله، پخش کن
              </button>
              <button
                onClick={() => choose("no")}
                className="flex-1 rounded-xl border border-gold-pale py-3 text-[12.5px] text-muted transition hover:bg-sunk/60"
              >
                بی‌صدا
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
