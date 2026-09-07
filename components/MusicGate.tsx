"use client";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { choose, getChoice, getServerChoice, subscribe } from "@/lib/music";

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
          className="fixed inset-0 z-110 flex items-center justify-center bg-nude px-8"
        >
          {/* the page grain does not reach a fixed overlay — repaint it */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-multiply"
            style={{
              background:
                "url('/design/texture/paper-seamless.jpg') repeat 0 0 / 190px 190px",
            }}
          />

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[300px] text-center"
          >
            <p className="label">پیش از شروع</p>
            <h2 id="music-gate-h" className="nastaliq mt-1 text-[24px] text-ink">
              با موسیقی؟
            </h2>
            <div aria-hidden className="rule mt-3 mb-6" />

            <p className="mx-auto mb-8 max-w-[230px] text-[12.5px] leading-[2] text-muted">
              یک قطعه‌ی آرام همراه دعوت‌نامه پخش می‌شود. هر وقت خواستی می‌توانی
              خاموشش کنی.
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                ref={yesBtn}
                onClick={() => choose("yes")}
                className="rounded-full bg-umber py-3.5 text-[12.5px] tracking-[0.06em] text-white transition hover:bg-ink"
              >
                بله، پخش کن
              </button>
              <button
                onClick={() => choose("no")}
                className="rounded-full border border-taupe py-3.5 text-[12.5px] tracking-[0.06em] text-umber transition hover:bg-sunk"
              >
                بی‌صدا ادامه بده
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
