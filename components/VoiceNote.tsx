"use client";
import { useEffect, useRef, useState } from "react";
import { toFa, pad2 } from "@/lib/fa";

/** A fixed set of bar heights — a waveform's look without decoding the audio. */
const BARS = [
  0.35, 0.6, 0.45, 0.8, 0.55, 0.95, 0.5, 0.7, 0.4, 0.85, 0.6, 1, 0.45, 0.75,
  0.35, 0.65, 0.5, 0.9, 0.4, 0.7, 0.55, 0.45, 0.8, 0.35,
];

function clock(sec: number): string {
  if (!Number.isFinite(sec)) return "۰:۰۰";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${toFa(m)}:${toFa(pad2(s))}`;
}

/**
 * A voice note in the log: play/pause, a bar you can scrub, and the time.
 *
 * The bars are decorative. Reading a real waveform means fetching and decoding
 * every clip in the conversation on load, which is a lot of work for a shape —
 * the progress fill is what actually carries the information.
 */
export default function VoiceNote({
  src,
  mine,
}: {
  src: string;
  mine: boolean;
}) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [at, setAt] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const el = audio.current;
    if (!el) return;

    const onTime = () => setAt(el.currentTime);
    const onMeta = () => setTotal(el.duration);
    const onEnd = () => {
      setPlaying(false);
      setAt(0);
    };

    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("ended", onEnd);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("ended", onEnd);
    };
  }, []);

  function toggle() {
    const el = audio.current;
    if (!el) return;
    if (el.paused) {
      el.play().then(
        () => setPlaying(true),
        () => setPlaying(false)
      );
    } else {
      el.pause();
      setPlaying(false);
    }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const el = audio.current;
    if (!el || !Number.isFinite(el.duration)) return;
    const box = e.currentTarget.getBoundingClientRect();
    // the track runs right-to-left with the document
    const ratio = (box.right - e.clientX) / box.width;
    el.currentTime = Math.min(Math.max(ratio, 0), 1) * el.duration;
  }

  const done = total > 0 ? at / total : 0;

  return (
    <div className="voice">
      <audio ref={audio} src={src} preload="metadata" />

      <button
        onClick={toggle}
        aria-label={playing ? "توقف" : "پخش پیام صوتی"}
        className={`voice-play ${mine ? "voice-play-mine" : ""}`}
      >
        {playing ? (
          <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 fill-current">
            <path d="M8 5h3v14H8zM13 5h3v14h-3z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 fill-current">
            <path d="M8 5.2 19 12 8 18.8z" />
          </svg>
        )}
      </button>

      <div className="voice-body">
        <div className="voice-wave" onClick={seek} role="presentation">
          {BARS.map((h, i) => (
            <span
              key={i}
              style={{
                height: `${Math.round(h * 100)}%`,
                opacity: i / BARS.length <= done ? 1 : 0.3,
              }}
            />
          ))}
        </div>
        <span className="voice-time tabular">
          {clock(at > 0 ? at : total)}
        </span>
      </div>
    </div>
  );
}
