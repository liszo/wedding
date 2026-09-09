"use client";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { wedding } from "@/content/config";
import { photos } from "@/content/photos.generated";

/**
 * Full bleed, at the photograph's own 1426:2016. The couple sits centre-right
 * and the top-left is empty wall, so the names go there — in ink, not white on
 * a scrim. The frame is black and white with a contrast lift baked in, which
 * keeps that wall bright enough for dark type; a scrim would only muddy it.
 *
 * Everything here is anchored `left`, not `start`. The page is RTL, so a
 * logical property would put the block in the opposite corner.
 */
export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  return (
    <section ref={ref} className="relative overflow-hidden">
      <motion.img
        src={photos.hero.src}
        width={photos.hero.w}
        height={photos.hero.h}
        alt={photos.hero.alt}
        fetchPriority="high"
        decoding="async"
        style={reduce ? undefined : { y }}
        className="block aspect-[1426/2016] w-full origin-top object-cover"
      />

      {/* insurance only — a whisper of paper over the corner so the type holds
          if the wall falls into shadow on a different crop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(150deg, rgba(253,251,249,.72) 0%, rgba(253,251,249,.34) 26%, rgba(253,251,249,0) 46%)",
        }}
      />

      <div className="absolute top-0 left-0 z-2 p-7 text-left sm:p-9">
        <motion.p
          data-reveal
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 1 }}
          className="hero-label mb-3"
        >
          دعوت‌نامه‌ی عروسی
        </motion.p>

        <motion.h1
          data-reveal
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="nastaliq text-[42px] leading-[1.42] text-ink sm:text-[46px]"
        >
          <span className="block">{wedding.brideName}</span>
          {/* the conjunction, set small and set back — it joins the two names
              without competing with them */}
          <span className="block text-[0.6em] leading-[1.15] text-muted">و</span>
          <span className="block">{wedding.groomName}</span>
        </motion.h1>

        <motion.div
          aria-hidden
          data-reveal
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.75, duration: 0.9 }}
          className="my-4 h-px w-12 origin-left bg-taupe"
        />

        <motion.p
          data-reveal
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 1 }}
          className="text-[13px] tracking-[0.16em] text-muted"
        >
          {wedding.weekdayFa} {wedding.dateFa}
        </motion.p>
      </div>
    </section>
  );
}
