"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  getChoice,
  getServerChoice,
  registerAudio,
  subscribe,
} from "@/lib/music";

const TRACK = "/music/track.mp3";

export default function MusicPlayer() {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const reduce = useReducedMotion();
  const choice = useSyncExternalStore(subscribe, getChoice, getServerChoice);

  // Hand the element to the store so MusicGate can start it from inside its
  // own click handler, while the user gesture still counts for autoplay.
  useEffect(() => {
    registerAudio(audio.current);
    return () => registerAudio(null);
  }, []);

  // The browser can stop playback without us (interruption, route change,
  // the track ending). Mirror the element's real state instead of guessing.
  useEffect(() => {
    const el = audio.current;
    if (!el) return;
    const on = () => setPlaying(true);
    const off = () => setPlaying(false);
    el.addEventListener("play", on);
    el.addEventListener("pause", off);
    el.addEventListener("ended", off);
    return () => {
      el.removeEventListener("play", on);
      el.removeEventListener("pause", off);
      el.removeEventListener("ended", off);
    };
  }, []);

  async function toggle() {
    const el = audio.current;
    if (!el) return;
    if (el.paused) {
      try {
        await el.play();
      } catch {
        // autoplay policy or a decode failure — the pause listener keeps
        // the button honest, nothing to do
      }
    } else {
      el.pause();
    }
  }

  return (
    <>
      {/* 4.7MB track. Only preloaded once the guest has said yes; a guest who
          chose silence never pays for it. */}
      <audio
        ref={audio}
        src={TRACK}
        loop
        preload={choice === "yes" ? "auto" : "none"}
        playsInline
      />

      <button
        onClick={toggle}
        aria-label={playing ? "قطع موسیقی" : "پخش موسیقی"}
        aria-pressed={playing}
        className="leaf fixed bottom-5 start-5 z-40 flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-md transition hover:-translate-y-0.5"
      >
        {playing ? (
          <span className="flex h-4 items-end gap-[3px]" aria-hidden>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-[3px] rounded-full bg-gold-deep"
                style={reduce ? { height: 10 } : undefined}
                animate={reduce ? undefined : { height: [6, 15, 8, 13, 6] }}
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
          <svg
            width="15"
            height="16"
            viewBox="0 0 15 16"
            aria-hidden
            className="ms-[2px] fill-gold-deep"
          >
            {/* RTL page, but a play triangle still points the way the audio
                runs — leave it pointing right */}
            <path d="M2 1.6a1 1 0 0 1 1.52-.85l10 6.4a1 1 0 0 1 0 1.7l-10 6.4A1 1 0 0 1 2 14.4Z" />
          </svg>
        )}
      </button>
    </>
  );
}
