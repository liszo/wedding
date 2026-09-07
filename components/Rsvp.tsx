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
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(
    null
  );
  const [busy, setBusy] = useState(false);
  // so the button label is honest after a first-time submit, without a reload
  const [saved, setSaved] = useState(Boolean(initial));

  async function submit() {
    if (attending === null) return;
    setBusy(true);
    setResult(null);
    try {
      const r = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attending, party_size: size, note }),
      });
      const body = await r.json().catch(() => ({}));
      setResult({
        ok: r.ok,
        text: body.message ?? (r.ok ? "ثبت شد." : "ثبت نشد. دوباره تلاش کن."),
      });
      if (r.ok) setSaved(true);
    } catch {
      setResult({ ok: false, text: "خطا در ارتباط. دوباره تلاش کن." });
    } finally {
      setBusy(false);
    }
  }

  if (closed)
    return (
      <div className="mx-auto max-w-[300px] text-center">
        <p className="text-[14px] text-ink">مهلت پاسخ تمام شد</p>
        <p className="mt-1 text-[12.5px] leading-[2] text-muted">
          اگر هنوز خبرمان نکرده‌ای، مستقیم به ما پیام بده.
        </p>
      </div>
    );

  return (
    <div className="mx-auto max-w-[300px]">
      <p className="mb-5 text-center text-[12.5px] text-muted">
        افتخار حضور می‌دهید؟
      </p>

      <div className="flex gap-2.5">
        <button
          onClick={() => setAttending(true)}
          aria-pressed={attending === true}
          className={`flex-1 rounded-full border py-3 text-[12.5px] transition ${
            attending === true
              ? "border-umber bg-umber text-white"
              : "border-taupe text-umber hover:bg-sunk"
          }`}
        >
          با کمال میل
        </button>
        <button
          onClick={() => setAttending(false)}
          aria-pressed={attending === false}
          className={`flex-1 rounded-full border py-3 text-[12.5px] transition ${
            attending === false
              ? "border-ink bg-ink text-white"
              : "border-taupe text-umber hover:bg-sunk"
          }`}
        >
          متأسفانه نمی‌رسم
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
              <span className="text-[12.5px] text-muted">چند نفر می‌آیید؟</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSize((n) => Math.max(1, n - 1))}
                  disabled={size <= 1}
                  aria-label="کمتر"
                  className="h-8 w-8 rounded-full border border-taupe text-umber transition hover:bg-sunk disabled:opacity-30"
                >
                  −
                </button>
                <span
                  className="tabular w-5 text-center text-[16px] text-ink"
                  aria-live="polite"
                >
                  {toFa(size)}
                </span>
                <button
                  onClick={() => setSize((n) => Math.min(10, n + 1))}
                  disabled={size >= 10}
                  aria-label="بیشتر"
                  className="h-8 w-8 rounded-full border border-taupe text-umber transition hover:bg-sunk disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always present, disabled until a choice is made — revealing them only
          after a tap left the card looking like an unfinished form. */}
      <label
        htmlFor="rsvp-note"
        className="mt-7 mb-1 block text-[10px] tracking-[0.2em] text-muted"
      >
        پیامی برای ما؟ (اختیاری)
      </label>
      <textarea
        id="rsvp-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={300}
        rows={2}
        disabled={attending === null}
        className="w-full resize-none border-0 border-b border-line bg-transparent px-0.5 py-2 text-[14px] leading-[1.9] outline-none transition-colors focus:border-umber disabled:opacity-40"
      />

      <button
        disabled={busy || attending === null}
        onClick={submit}
        className="mt-6 w-full rounded-full bg-umber py-3.5 text-[12.5px] tracking-[0.06em] text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-35"
      >
        {busy ? "..." : saved ? "به‌روزرسانی پاسخ" : "ثبت پاسخ"}
      </button>

      {result ? (
        <p
          role="status"
          className={`mt-4 text-center text-[12px] ${
            result.ok ? "text-umber" : "text-crimson"
          }`}
        >
          {result.text}
        </p>
      ) : (
        <p className="mt-4 text-center text-[11px] text-muted">
          لطفاً تا {wedding.rsvpDeadlineFa} پاسخ خود را ثبت کنید.
        </p>
      )}
    </div>
  );
}
