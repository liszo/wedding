"use client";
import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { story } from "@/content/story";

export default function Story() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.6"],
  });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 26 });

  return (
    <section className="px-6 py-20">
      <h2 className="mb-14 text-center text-lg text-candle">قصه‌ی ما</h2>

      <div ref={ref} className="relative mx-auto max-w-md">
        {/* the wick: a hairline that burns down as you scroll */}
        <div className="absolute inset-y-0 start-[7px] w-px bg-mist/10" />
        <motion.div
          aria-hidden
          style={{ scaleY: fill, transformOrigin: "top" }}
          className="absolute inset-y-0 start-[7px] w-px bg-candle/70"
        />

        <div className="flex flex-col gap-14">
          {story.map((m, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="relative ps-10"
            >
              <span
                aria-hidden
                className="absolute start-0 top-1.5 h-[15px] w-[15px] rounded-full border border-candle/40 bg-night"
              />
              <span
                aria-hidden
                className="absolute start-[5px] top-[11px] h-[5px] w-[5px] rounded-full bg-candle"
              />

              <p className="tabular mb-1 text-xs tracking-widest text-candle/60">
                {m.when}
              </p>
              <h3 className="mb-2 text-base text-mist">{m.title}</h3>
              <p className="text-sm leading-7 text-mist/60">{m.body}</p>

              {m.image && (
                <img
                  src={m.image}
                  alt=""
                  loading="lazy"
                  className="mt-4 w-full rounded-2xl ring-1 ring-mist/10"
                />
              )}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}