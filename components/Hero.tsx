"use client";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { wedding, coupleNames } from "@/content/config";
import { photos } from "@/content/photos.generated";
import { ORNAMENT } from "./ui";

/**
 * Full-bleed black and white. The photograph is desaturated at build time
 * (scripts/prepare-assets.ts, platinum-print treatment) rather than with a CSS
 * filter, so the browser never paints the colour version first.
 *
 * Two gradients sit over it: a short one at the top so the guest's name reads
 * against the bright wall, and a deep olive-tinted one at the bottom that both
 * carries the type and warms the neutral greys back toward the paper below.
 */
export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // the photograph drifts a little slower than the page
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <section ref={ref} className="relative z-1 overflow-hidden">
      <motion.img
        src={photos.hero.src}
        width={photos.hero.w}
        height={photos.hero.h}
        alt={photos.hero.alt}
        fetchPriority="high"
        decoding="async"
        style={reduce ? undefined : { y, scale }}
        className="block aspect-4/5 w-full origin-top object-cover object-top"
      />

      {/* The veil. Its dark end has to arrive by ~58%, not at the bottom edge:
          the dome that follows overlaps the last 78px of this section, so any
          darkness below ~80% is hidden and the caption would sit unbacked. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(33,40,25,.42) 0%, rgba(33,40,25,0) 22%, rgba(33,40,25,.14) 40%, rgba(33,40,25,.55) 58%, rgba(33,40,25,.82) 76%, rgba(33,40,25,.9) 100%)",
        }}
      />

      {/* The guest is greeted by name on the envelope gate, which is the first
          thing they see. Repeating it over the photograph crowded the frame. */}

      {/* clears the 78px dome crest with room to spare */}
      <div className="absolute inset-x-0 bottom-[92px] z-2 px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="nastaliq text-[44px] text-[#F9F6EC] sm:text-[46px]"
          style={{ textShadow: "0 3px 26px rgba(18,24,14,.6)" }}
        >
          {coupleNames}
        </motion.h1>

        <motion.img
          src={ORNAMENT.ruleBraid}
          alt=""
          aria-hidden
          initial={{ opacity: 0, scaleX: 0.6 }}
          animate={{ opacity: 0.85, scaleX: 1 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="lift-always mx-auto my-1 w-[150px]"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 1 }}
          className="text-[12.5px] tracking-[0.22em] text-[#EFE9D4]"
        >
          {wedding.weekdayFa} {wedding.dateFa}
        </motion.p>
      </div>
    </section>
  );
}
