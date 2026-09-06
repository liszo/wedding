"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { wedding } from "@/content/config";
import { toFa } from "@/lib/fa";
import type { MyRsvp } from "@/lib/rsvp-read";
import { ICON } from "./ui";

/**
 * A double-ruled card — an inner hairline inset from the border — under a small
 * gold rings emblem. That is the engraved-stationery look; a single border
 * reads as a web form.
 */
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

  return (
    <div className="mx-auto max-w-[330px]">
      {/* The emblem sits above the card rather than notched into its border.
          Notching needs an opaque plate behind it, and a plate painted over a
          band that carries the paper grain always reads as a lighter
          rectangle — there is no colour that matches a multiplied texture. */}
      <img
        src={ICON.rings}
        alt=""
        aria-hidden
        className="mx-auto mb-3 h-[38px] w-auto opacity-90"
      />

      <div className="relative rounded-[20px] border border-gold-pale bg-paper-lite/70 px-6 pt-8 pb-7">
        {/* inner rule, inset from the card edge — the engraved-stationery look */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[7px] rounded-[14px] border border-gold/25"
        />

        {closed ? (
          <div className="text-center">
            <p className="mb-1 text-[15px] text-ink">مهلت پاسخ تمام شد</p>
            <p className="text-[13px] leading-[1.9] text-muted">
              اگر هنوز خبرمان نکرده‌ای، مستقیم به ما پیام بده.
            </p>
          </div>
        ) : (
          <div className="relative">
            <p className="mb-4 text-center text-[12.5px] text-muted">
              افتخار حضور می‌دهید؟
            </p>

            <div className="flex gap-2.5">
              <button
                onClick={() => setAttending(true)}
                aria-pressed={attending === true}
                className={`flex-1 rounded-xl border px-1.5 py-3 text-[12.5px] transition ${
                  attending === true
                    ? "border-olive bg-olive text-paper"
                    : "border-gold-pale text-muted hover:bg-sunk/60"
                }`}
              >
                با کمال میل
              </button>
              <button
                onClick={() => setAttending(false)}
                aria-pressed={attending === false}
                className={`flex-1 rounded-xl border px-1.5 py-3 text-[12.5px] transition ${
                  attending === false
                    ? "border-olive-ink bg-olive-ink text-paper"
                    : "border-gold-pale text-muted hover:bg-sunk/60"
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
                  <div className="mt-5 flex items-center justify-between gap-4">
                    <span className="text-[12.5px] text-muted">
                      چند نفر می‌آیید؟
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSize((n) => Math.max(1, n - 1))}
                        disabled={size <= 1}
                        aria-label="کمتر"
                        className="h-9 w-9 rounded-full border border-gold-pale text-gold-ink transition hover:bg-sunk/60 disabled:opacity-35"
                      >
                        −
                      </button>
                      <span
                        className="tabular w-6 text-center text-lg text-ink"
                        aria-live="polite"
                      >
                        {toFa(size)}
                      </span>
                      <button
                        onClick={() => setSize((n) => Math.min(10, n + 1))}
                        disabled={size >= 10}
                        aria-label="بیشتر"
                        className="h-9 w-9 rounded-full border border-gold-pale text-gold-ink transition hover:bg-sunk/60 disabled:opacity-35"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* The note field and the submit button are always here, disabled
                until a choice is made. Revealing them only after a tap left the
                card looking like an unfinished form. */}
            <label
              htmlFor="rsvp-note"
              className="mt-6 mb-1.5 block text-[11px] tracking-[0.13em] text-muted"
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
              className="w-full resize-none border-0 border-b border-gold-pale bg-transparent px-0.5 py-2 text-[14px] leading-[1.9] outline-none transition-colors focus:border-olive disabled:opacity-45"
            />

            <button
              disabled={busy || attending === null}
              onClick={submit}
              className="mt-5 w-full rounded-xl border border-olive bg-olive py-3.5 text-[12.5px] text-paper transition hover:bg-olive-deep disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? "..." : saved ? "به‌روزرسانی پاسخ" : "ثبت پاسخ"}
            </button>

            {result ? (
              <p
                role="status"
                className={`mt-4 text-center text-[12px] ${
                  result.ok ? "text-gold-ink" : "text-crimson"
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
        )}
      </div>
    </div>
  );
}
