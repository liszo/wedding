"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

const TRACK = "/music/track.mp3";

export default function MusicPlayer() {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  async function toggle() {
    const el = audio.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      try {
        await el.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    }
  }

  if (!ready) return null;

  return (
    <>
      <audio ref={audio} src={TRACK} loop preload="none" playsInline />

      <button
        onClick={toggle}
        aria-label={playing ? "قطع موسیقی" : "پخش موسیقی"}
        className="fixed bottom-5 start-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-raised/85 ring-1 ring-candle/25 backdrop-blur-md transition hover:ring-candle/50"
      >
        {playing ? (
          <span className="flex items-end gap-[3px]" aria-hidden>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-[3px] rounded-full bg-candle"
                animate={{ height: [6, 15, 8, 13, 6] }}
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </span>
        ) : (
          <span className="ms-[2px] text-candle" aria-hidden>
            ►
          </span>
        )}
      </button>
    </>
  );
}