"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { isMobile } from "@/lib/phone";

export default function LostLinkModal() {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(
    null
  );
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    input.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function close() {
    setOpen(false);
    setResult(null);
    trigger.current?.focus();
  }

  async function submit() {
    if (!phone.trim() || busy) return;
    setBusy(true);
    setResult(null);
    try {
      const r = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const j = await r.json().catch(() => ({}));
      setResult({ ok: r.ok, text: j.message ?? "دوباره تلاش کنید." });
      if (r.ok) setTimeout(() => window.location.replace("/"), 1200);
    } catch {
      setResult({ ok: false, text: "خطا در ارتباط. دوباره تلاش کنید." });
    } finally {
      setBusy(false);
    }
  }

  // Accepts 09..., +989..., ۰۹... — all the same number
  const valid = isMobile(phone);

  return (
    <>
      <button
        ref={trigger}
        onClick={() => setOpen(true)}
        className="text-sm text-muted underline underline-offset-4 transition hover:text-gold-ink"
      >
        لینک دعوتت را گم کرده‌ای؟
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-80 flex items-end justify-center bg-ink/45 p-0 backdrop-blur-sm sm:items-center sm:p-6"
            onClick={close}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="lost-link-h"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.key === "Escape" && close()}
              className="leaf w-full max-w-sm rounded-t-3xl p-6 text-start sm:rounded-3xl"
            >
              <h2 id="lost-link-h" className="nastaliq mb-1 text-2xl text-gold-deep">
                شماره‌ات را وارد کن
              </h2>
              <p className="mb-5 text-sm leading-7 text-muted">
                اگر شماره‌ات در فهرست مهمان‌ها باشد، دوباره شناساییت می‌کنیم.
              </p>

              <label htmlFor="lost-phone" className="sr-only">
                شماره موبایل
              </label>
              <input
                id="lost-phone"
                ref={input}
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="09123456789"
                className="mb-3 w-full rounded-xl border border-gold-pale bg-sunk/40 px-4 py-3 text-center outline-none placeholder:text-muted/50 focus:border-olive"
              />

              {result && (
                <p
                  role="status"
                  className={`mb-3 text-sm ${
                    result.ok ? "text-gold-ink" : "text-crimson"
                  }`}
                >
                  {result.text}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  disabled={busy || !valid}
                  onClick={submit}
                  className="flex-1 rounded-xl bg-olive py-3 text-sm font-medium text-paper transition hover:bg-olive-deep disabled:opacity-45"
                >
                  {busy ? "..." : "تأیید"}
                </button>
                <button
                  onClick={close}
                  className="rounded-xl border border-gold-pale px-5 py-3 text-sm text-gold-ink transition hover:bg-sunk"
                >
                  بستن
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
