"use client";
import { useEffect, useState } from "react";
import { wedding } from "@/content/config";
import { toFa, pad2 } from "@/lib/fa";

type Left = { d: number; h: number; m: number; s: number };

function remaining(): Left | null {
  const ms = new Date(wedding.dateISO).getTime() - Date.now();
  if (ms <= 0) return null;
  return {
    d: Math.floor(ms / 86_400_000),
    h: Math.floor(ms / 3_600_000) % 24,
    m: Math.floor(ms / 60_000) % 60,
    s: Math.floor(ms / 1000) % 60,
  };
}

export default function Countdown() {
  const [left, setLeft] = useState<Left | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLeft(remaining());
    setReady(true);
    const t = setInterval(() => setLeft(remaining()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!ready) return <div className="h-28" aria-hidden />;

  if (!left)
    return (
      <p className="py-10 text-center text-lg text-candle">
        امروز روز ماست
      </p>
    );

  const cells = [
    { v: toFa(left.d), l: "روز" },
    { v: toFa(pad2(left.h)), l: "ساعت" },
    { v: toFa(pad2(left.m)), l: "دقیقه" },
    { v: toFa(pad2(left.s)), l: "ثانیه" },
  ];

  return (
    <div className="flex items-start justify-center gap-6 py-10 sm:gap-10">
      {cells.map((c) => (
        <div key={c.l} className="flex flex-col items-center gap-1">
          <span className="tabular text-3xl font-medium text-candle sm:text-4xl">
            {c.v}
          </span>
          <span className="text-xs text-mist/45">{c.l}</span>
        </div>
      ))}
    </div>
  );
}