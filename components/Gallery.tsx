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
import { SectionHead } from "./ui";

const SET: Photo[] = [
  photos.gallery1,
  photos.gallery2,
  photos.gallery3,
  photos.gallery4,
  photos.gallery5,
];

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
        label="چند قاب از شبِ بله‌برون و خواستگاری"
        title="گالری"
        className="mb-10"
      />

      <div className="mx-auto max-w-[300px] columns-2 gap-2">
        {SET.map((p, i) => (
          <motion.button
            key={p.src}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: (i % 2) * 0.08 }}
            onClick={(e) => {
              opener.current = e.currentTarget;
              setAt(i);
            }}
            aria-label={`بزرگ‌کردن عکس ${toFa(i + 1)}`}
            className="mb-2 block w-full break-inside-avoid transition hover:opacity-85"
          >
            <img
              src={p.thumb}
              width={p.tw}
              height={p.th}
              alt={p.alt}
              loading="lazy"
              decoding="async"
              className="block w-full rounded-[6px] object-cover"
            />
          </motion.button>
        ))}
      </div>

      {mounted && createPortal(lightbox, document.body)}
    </>
  );
}
