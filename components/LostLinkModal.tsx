"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function LostLinkModal() {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setMsg("");
    try {
      const r = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const j = await r.json();
      setMsg(j.message);
      if (r.ok) setTimeout(() => window.location.replace("/"), 1500);
    } catch {
      setMsg("خطا در ارتباط. دوباره تلاش کنید.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm underline underline-offset-4 opacity-70"
      >
        لینک دعوتت را گم کرده‌ای؟
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-t-3xl bg-white p-6 sm:rounded-3xl"
            >
              <h2 className="mb-2 text-lg font-bold">شماره‌ات را وارد کن</h2>
              <p className="mb-4 text-sm opacity-70">
                اگر شماره‌ات در فهرست مهمان‌ها باشد، دوباره شناساییت می‌کنیم.
              </p>

              <input
                type="tel"
                inputMode="numeric"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09123456789"
                className="mb-3 w-full rounded-xl border border-black/15 px-4 py-3 text-center"
              />

              {msg && <p className="mb-3 text-sm">{msg}</p>}

              <div className="flex gap-2">
                <button
                  disabled={busy}
                  onClick={submit}
                  className="flex-1 rounded-xl bg-black py-3 text-white disabled:opacity-50"
                >
                  {busy ? "..." : "تأیید"}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-black/15 px-5 py-3"
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