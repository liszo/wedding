"use client";
import { useSyncExternalStore } from "react";
import { wedding } from "@/content/config";
import { toFa, pad2 } from "@/lib/fa";

const TARGET = new Date(wedding.dateISO).getTime();

/**
 * "Now" is an external system, not React state — the server has no answer for
 * it and the client's answer changes every second. useSyncExternalStore is the
 * shape React wants for this, and it avoids the cascading render a
 * setState-in-effect mount gate causes.
 */
function subscribe(onChange: () => void) {
  const t = setInterval(onChange, 1000);
  return () => clearInterval(t);
}

/** Whole seconds, so the snapshot is stable between ticks. */
function snapshot(): number {
  return Math.max(0, Math.floor((TARGET - Date.now()) / 1000));
}

function serverSnapshot(): null {
  return null;
}

export default function Countdown() {
  const secs = useSyncExternalStore(subscribe, snapshot, serverSnapshot);

  const cells: [string, string][] =
    secs === null
      ? [
          ["", "روز"],
          ["", "ساعت"],
          ["", "دقیقه"],
          ["", "ثانیه"],
        ]
      : [
          [toFa(Math.floor(secs / 86_400)), "روز"],
          [toFa(pad2(Math.floor(secs / 3_600) % 24)), "ساعت"],
          [toFa(pad2(Math.floor(secs / 60) % 60)), "دقیقه"],
          [toFa(pad2(secs % 60)), "ثانیه"],
        ];

  if (secs === 0)
    return (
      <p className="nastaliq mb-10 text-center text-[24px] text-ink">
        امروز روز ماست
      </p>
    );

  return (
    /* dir="ltr" so the units run day → hour → minute → second from the left,
       the way a clock is read. In the page's RTL flow they would otherwise
       come out reversed, with the seconds on the left. */
    <div
      dir="ltr"
      className="mx-auto mb-10 flex max-w-[280px] justify-center"
      aria-label="زمان باقی‌مانده تا مراسم"
    >
      {cells.map(([v, l], i) => (
        <div
          key={l}
          className={`flex-1 text-center ${
            i === 0 ? "" : "border-l border-line"
          }`}
        >
          {/* the empty first paint reserves the exact height the digits need */}
          <span className="tabular block text-[21px] font-light text-ink">
            {v || " "}
          </span>
          <small className="mt-0.5 block text-[9px] tracking-[0.24em] text-muted">
            {l}
          </small>
        </div>
      ))}
    </div>
  );
}
