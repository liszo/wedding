"use client";
import { motion } from "motion/react";
import { wedding } from "@/content/config";

const names = `${wedding.brideName} و ${wedding.groomName}`;

export default function Hero({ guestName }: { guestName?: string }) {
  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6">
      {/* the candle being lit */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.4, ease: "easeOut" }}
        className="pointer-events-none absolute left-1/2 top-[38%] h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(245,201,126,0.34) 0%, rgba(222,139,61,0.14) 42%, transparent 72%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        {guestName && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.9 }}
            className="mb-6 text-sm tracking-widest text-candle/70"
          >
            {guestName} عزیز
          </motion.p>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1.4, ease: "easeOut" }}
          className="nastaliq text-5xl text-candle sm:text-7xl"
        >
          {names}
        </motion.h1>

        {/* the mirror */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1.6 }}
          className="reflect -mt-2 nastaliq text-5xl text-candle sm:text-7xl"
        >
          {names}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="mt-8 text-base text-mist/60"
        >
          {wedding.weekdayFa} {wedding.dateFa}
        </motion.p>
      </div>

      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0], y: [0, 8, 0] }}
        transition={{ delay: 2.6, duration: 2.4, repeat: Infinity }}
        className="absolute bottom-10 text-2xl text-candle"
      >
        ⌄
      </motion.div>
    </section>
  );
}