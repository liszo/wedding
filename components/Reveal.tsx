"use client";
import { motion } from "motion/react";

/**
 * Fade-and-rise on first scroll into view. `once` so nothing re-animates when
 * a guest scrolls back up, and motion respects prefers-reduced-motion itself.
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
