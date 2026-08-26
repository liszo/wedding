"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { wedding } from "@/content/config";
import { toFa } from "@/lib/fa";
import type { MyRsvp } from "@/lib/rsvp-read";

export default function Rsvp({
  initial,
  closed,
}: {
  initial: MyRsvp;
  closed: boolean;
}) {
  const [attending, setAttending] = useState<boolean | null>(
    initial ? initial.attending : null
  );
  const [size, setSize] = useState(initial?.party_size || 1);
  const [note, setNote] = useState(initial?.note ?? "");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (attending === null) return;
    setBusy(true);
    setMsg("");
    try {
      const r = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attending, party_size: size, note }),
      });
      setMsg((await r.json()).message);
    } catch {
      setMsg("خطا در ارتباط. دوباره تلاش کن.");
    } finally {
      setBusy(false);
    }
  }

  if (closed)
    return (
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-md rounded-3xl bg-raised/70 p-7 text-center ring-1 ring-candle/10">
          <h2 className="mb-2 text-lg text-candle">مهلت پاسخ تمام شد</h2>
          <p className="text-sm text-mist/60">
            اگر هنوز خبرمان نکرده‌ای، مستقیم به ما پیام بده.
          </p>
        </div>
      </section>
    );

  return (
    <section className="px-6 pb-24">
      <div className="mx-auto max-w-md rounded-3xl bg-raised/70 p-7 ring-1 ring-candle/10">
        <h2 className="mb-1 text-center text-lg text-candle">می‌آیی؟</h2>
        <p className="mb-6 text-center text-xs text-mist/45">
          مهلت پاسخ تا {wedding.rsvpDeadlineFa}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setAttending(true)}
            className={`rounded-xl py-3 text-sm transition ${
              attending === true
                ? "bg-candle text-night"
                : "bg-candle/10 text-candle ring-1 ring-candle/20"
            }`}
          >
            با کمال میل
          </button>
          <button
            onClick={() => setAttending(false)}
            className={`rounded-xl py-3 text-sm transition ${
              attending === false
                ? "bg-mist/85 text-night"
                : "bg-mist/5 text-mist/70 ring-1 ring-mist/15"
            }`}
          >
            نمی‌توانم
          </button>
        </div>

        <AnimatePresence initial={false}>
          {attending === true && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-6 flex items-center justify-between gap-4">
                <span className="text-sm text-mist/60">چند نفر می‌آیید؟</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSize((n) => Math.max(1, n - 1))}
                    className="h-9 w-9 rounded-full bg-candle/10 text-candle ring-1 ring-candle/20"
                    aria-label="کمتر"
                  >
                    −
                  </button>
                  <span className="tabular w-6 text-center text-lg text-candle">
                    {toFa(size)}
                  </span>
                  <button
                    onClick={() => setSize((n) => Math.min(10, n + 1))}
                    className="h-9 w-9 rounded-full bg-candle/10 text-candle ring-1 ring-candle/20"
                    aria-label="بیشتر"
                  >
                    +
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {attending !== null && (
          <>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={300}
              rows={3}
              placeholder="پیامی برای ما؟ (اختیاری)"
              className="mt-5 w-full resize-none rounded-xl bg-night/50 p-4 text-sm ring-1 ring-mist/10 outline-none placeholder:text-mist/30 focus:ring-candle/40"
            />

            <button
              disabled={busy}
              onClick={submit}
              className="mt-3 w-full rounded-xl bg-candle py-3.5 text-sm font-medium text-night transition hover:bg-saffron disabled:opacity-50"
            >
              {busy ? "..." : initial ? "به‌روزرسانی پاسخ" : "ثبت پاسخ"}
            </button>
          </>
        )}

        {msg && (
          <p className="mt-4 text-center text-sm text-candle">{msg}</p>
        )}
      </div>
    </section>
  );
}