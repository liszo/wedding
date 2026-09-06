"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import type { WallComment } from "@/lib/posts";
import { agoFa } from "@/lib/time";
import { toFa } from "@/lib/fa";
import Sticker from "./Sticker";
import StickerPicker from "./StickerPicker";

export default function Comments({
  postId,
  comments,
  canWrite,
}: {
  postId: string;
  comments: WallComment[];
  canWrite: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [picker, setPicker] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function send(sticker?: string) {
    if (!sticker && !text.trim()) return;
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          sticker ? { post_id: postId, sticker } : { post_id: postId, body: text }
        ),
      });
      const j = await r.json().catch(() => ({}));

      if (r.ok) {
        setText("");
        setPicker(false);
        router.refresh();
      } else {
        setErr(j.message ?? `خطا (${r.status})`);
      }
    } catch {
      setErr("خطا در ارتباط.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-xs text-muted transition hover:text-gold-ink"
      >
        {comments.length > 0
          ? `${toFa(comments.length)} نظر`
          : canWrite
            ? "نظر بگذار"
            : "بدون نظر"}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex flex-col gap-3 border-t border-gold-pale pt-3">
              {comments.map((c) => (
                <div key={c.id} className="text-sm">
                  <span className="text-gold-ink">{c.author}</span>
                  <time
                    dateTime={c.created_at}
                    className="mx-2 text-xs text-muted/70"
                  >
                    {agoFa(c.created_at)}
                  </time>
                  {c.sticker ? (
                    <div className="mt-1">
                      <Sticker id={c.sticker} size={56} />
                    </div>
                  ) : (
                    <p className="mt-1 whitespace-pre-wrap leading-6 text-ink">
                      {c.body}
                    </p>
                  )}
                </div>
              ))}

              {canWrite && (
                <div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPicker((p) => !p)}
                      aria-label="استیکر"
                      aria-expanded={picker}
                      className={`rounded-xl border px-3 text-sm transition ${
                        picker
                          ? "border-olive/45 bg-olive/12"
                          : "border-gold-pale bg-sunk/40"
                      }`}
                    >
                      <Sticker id="heart" size={18} />
                    </button>
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && send()}
                      maxLength={300}
                      placeholder="نظرت..."
                      aria-label="نوشتن نظر"
                      className="min-w-0 flex-1 rounded-xl border border-gold-pale bg-sunk/40 px-3 py-2 text-sm outline-none placeholder:text-muted/60 focus:border-olive"
                    />
                    <button
                      disabled={busy || !text.trim()}
                      onClick={() => send()}
                      aria-label="ارسال نظر"
                      className="rounded-xl border border-gold-pale px-4 text-sm text-gold-ink transition hover:bg-sunk disabled:opacity-40"
                    >
                      ↵
                    </button>
                  </div>

                  <StickerPicker open={picker} onPick={(id) => send(id)} />

                  {err && (
                    <p role="status" className="mt-2 text-xs text-crimson">
                      {err}
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}