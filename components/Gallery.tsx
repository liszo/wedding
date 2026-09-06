"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { photos, type Photo } from "@/content/photos.generated";
import { toFa } from "@/lib/fa";
import { SectionHead, ORNAMENT } from "./ui";

/**
 * Curated, not everything. `tableau` is 600x800 screenshot-grade and stays out
 * (design/ASSETS.md); `candlelit` is only 240x320 but it is a real moment, so
 * it ships — the lightbox never upscales past a photo's intrinsic width, which
 * keeps it sharp and small instead of large and soft.
 */
const SET: Photo[] = [
  photos.venue,
  photos.sofreh,
  photos.ringBouquet,
  photos.ringDetail,
  photos.proposalSquare,
  photos.candlelit,
];

export default function Gallery() {
  const [at, setAt] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => {
    setAt(null);
    opener.current?.focus();
  }, []);

  const step = useCallback((by: number) => {
    setAt((i) => (i === null ? i : (i + by + SET.length) % SET.length));
  }, []);

  useEffect(() => {
    if (at === null) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      // the lightbox is RTL: ArrowLeft advances, ArrowRight goes back
      else if (e.key === "ArrowLeft") step(1);
      else if (e.key === "ArrowRight") step(-1);
      else if (e.key === "Tab") e.preventDefault(); // three controls, all reachable
    }

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [at, close, step]);

  const current = at === null ? null : SET[at];

  return (
    <>
      <SectionHead
        id="gallery-h"
        eyebrow="چند قاب از شبِ بله‌برون"
        title="گالری"
        mark={ORNAMENT.ruleFloral}
        under={null}
        tone="olive"
      />

      <div className="mx-auto max-w-[342px] columns-2 gap-2.5">
        {SET.map((p, i) => (
          <motion.button
            key={p.src}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: (i % 2) * 0.08 }}
            onClick={(e) => {
              opener.current = e.currentTarget;
              setAt(i);
            }}
            aria-label={`بزرگ‌کردن عکس: ${p.alt}`}
            className="mb-2.5 block w-full break-inside-avoid rounded-[14px] border border-gold-lite/35 bg-olive-deep/40 p-1 transition hover:-translate-y-0.5 hover:border-gold-lite/70"
          >
            <img
              src={p.thumb}
              width={p.tw}
              height={p.th}
              alt={p.alt}
              loading="lazy"
              decoding="async"
              /* one step tighter than the frame so the mount reads as even */
              className="block w-full rounded-[10px] object-cover"
            />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {current && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={current.alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.15 : 0.28 }}
            onClick={close}
            className="fixed inset-0 z-95 flex flex-col items-center justify-center gap-4 bg-olive-ink/92 p-4 backdrop-blur-sm"
          >
            <motion.img
              key={current.src}
              src={current.src}
              width={current.w}
              height={current.h}
              alt={current.alt}
              initial={reduce ? false : { scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              // never upscale past the source — two of these are low-res
              style={{ maxWidth: `min(100%, ${current.w}px)` }}
              className="max-h-[76dvh] w-auto rounded-[14px] border border-gold-lite/30 object-contain shadow-2xl"
            />

            <div
              className="flex items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => step(-1)}
                aria-label="عکس قبلی"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-gold-lite/40 text-xl text-on-olive transition hover:bg-paper/10"
              >
                ›
              </button>
              <button
                ref={closeBtn}
                onClick={close}
                className="rounded-full border border-gold-lite/40 px-5 py-2.5 text-sm text-on-olive transition hover:bg-paper/10"
              >
                بستن
              </button>
              <button
                onClick={() => step(1)}
                aria-label="عکس بعدی"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-gold-lite/40 text-xl text-on-olive transition hover:bg-paper/10"
              >
                ‹
              </button>
            </div>

            {/* "۲ / ۶" reverses under RTL bidi and reads as "6 of 2" — the
                word form has no such ambiguity */}
            <p className="tabular text-xs text-gold-lite">
              {toFa(at! + 1)} از {toFa(SET.length)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
