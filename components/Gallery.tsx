"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { photos, type Photo } from "@/content/photos.generated";
import { toFa } from "@/lib/fa";
import { openInvite } from "@/lib/wall-invite";
import { SectionHead } from "./ui";

const SET: Photo[] = [
  photos.gallery1,
  photos.gallery2,
  photos.gallery3,
  photos.gallery4,
  photos.gallery5,
];

/**
 * Which frame goes in which column, as indices into SET. Split so the two
 * columns come out close in height at the rendered width (~146px each):
 * the tall pair are separated and the two landscapes are separated.
 * The first column is the right-hand one — the page is RTL.
 */
const COLUMNS: number[][] = [
  [0, 2, 4],
  [1, 3],
];

/** The shorter column, where the closing tile stretches to make up the height. */
const FILLER_COLUMN = 1;

/** Chevrons as SVG, not « » — those characters are bidi-mirrored, so in an
 *  RTL document the glyphs render pointing the opposite way and the two
 *  buttons look swapped. A path cannot be mirrored by the bidi algorithm. */
function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-5 w-5 fill-none stroke-current stroke-[1.5]"
      style={dir === "right" ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* "Are we on the client?", without a setState-in-effect mount flag. There is
   no document to portal into during SSR. */
const NEVER = () => () => {};
const onClient = () => true;
const onServer = () => false;

export default function Gallery() {
  const [at, setAt] = useState<number | null>(null);
  const mounted = useSyncExternalStore(NEVER, onClient, onServer);
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
      // RTL reading order: ArrowLeft advances, ArrowRight goes back
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

  /**
   * Rendered into <body> rather than in place. `position: fixed` resolves
   * against the nearest ancestor with a transform, and this sits inside a
   * motion element that has one — which is why the lightbox used to open
   * clipped to the bottom of the card instead of filling the screen.
   */
  const lightbox = (
    <AnimatePresence>
      {current && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={current.alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.15 : 0.25 }}
          onClick={close}
          dir="rtl"
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-5 bg-ink p-4"
        >
          <motion.img
            key={current.src}
            src={current.src}
            width={current.w}
            height={current.h}
            alt={current.alt}
            initial={reduce ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[74dvh] w-auto max-w-full rounded-[8px] object-contain"
          />

          <div
            className="flex items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* In RTL this first child renders on the RIGHT, which is where
                "previous" belongs, so it points right. */}
            <button
              onClick={() => step(-1)}
              aria-label="عکس قبلی"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white/90 transition hover:bg-white/10"
            >
              <Chevron dir="right" />
            </button>
            <button
              ref={closeBtn}
              onClick={close}
              className="rounded-full border border-white/30 px-6 py-2.5 text-[12.5px] text-white/90 transition hover:bg-white/10"
            >
              بستن
            </button>
            <button
              onClick={() => step(1)}
              aria-label="عکس بعدی"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white/90 transition hover:bg-white/10"
            >
              <Chevron dir="left" />
            </button>
          </div>

          {/* "۲ / ۵" reverses under RTL bidi and reads as "5 of 2" — the word
              form has no such ambiguity */}
          <p className="tabular text-[11px] tracking-[0.2em] text-white/55">
            {toFa(at! + 1)} از {toFa(SET.length)}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <SectionHead
        id="gallery-h"
        icon="📷"
        label="چند قاب از شبِ بله‌برون و خواستگاری"
        title="گالری"
        className="mb-10"
      />

      {/* Two hand-balanced columns rather than `columns-2` masonry.
          The five frames are a mix of portrait, square and landscape, so a
          uniform grid cell would have to crop two of them badly; here each
          keeps its own shape. Masonry's problem was that the columns ended at
          different heights and left a hole — COLUMNS splits them so the
          difference is small, and the closing tile takes `flex-1` to absorb
          whatever is left. Both columns finish flush at any width. */}
      <div className="mx-auto flex max-w-[300px] gap-2">
        {COLUMNS.map((column, ci) => (
          <div key={ci} className="flex flex-1 flex-col gap-2">
            {column.map((i) => {
              const p = SET[i];
              return (
                <motion.button
                  key={p.src}
                  data-reveal
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: ci * 0.08 }}
                  onClick={(e) => {
                    opener.current = e.currentTarget;
                    setAt(i);
                  }}
                  aria-label={`بزرگ‌کردن عکس ${toFa(i + 1)}`}
                  className="block w-full transition hover:opacity-85"
                >
                  <img
                    src={p.thumb}
                    width={p.tw}
                    height={p.th}
                    alt={p.alt}
                    loading="lazy"
                    decoding="async"
                    className="block w-full rounded-[6px]"
                  />
                </motion.button>
              );
            })}

            {/* the frame that has not been taken yet */}
            {ci === FILLER_COLUMN && (
              <motion.button
                data-reveal
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.08 }}
                onClick={openInvite}
                className="gallery-add"
              >
                <span aria-hidden className="gallery-add-plus">
                  +
                </span>
                <span className="text-[11px] leading-[1.9] text-umber">
                  قاب‌های بعدی از شب عروسی
                  <br />
                  رو شما اضافه کنین 📸
                </span>
                <span className="gallery-add-go">بگذارید اینجا</span>
              </motion.button>
            )}
          </div>
        ))}
      </div>

      {mounted && createPortal(lightbox, document.body)}
    </>
  );
}
