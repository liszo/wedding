"use client";
import { motion } from "motion/react";

/**
 * Fade-and-rise on first scroll into view. `once` so nothing re-animates when
 * a guest scrolls back up, and motion respects prefers-reduced-motion itself.
 *
 * `data-reveal` is the hook the no-JS stylesheet in app/layout.tsx uses to
 * cancel the starting state — without it a guest with scripting off would get
 * an empty card.
 */
export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      data-reveal
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -5% 0px" }}
      transition={{ duration: 0.9, delay, ease: [0.2, 0.7, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
