"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import type { WallComment } from "@/lib/posts";
import { agoFa } from "@/lib/time";
import { toFa } from "@/lib/fa";

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
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const r = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, body: text }),
      });
      if (r.ok) {
        setText("");
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-xs text-mist/40 hover:text-mist/70"
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
            <div className="mt-3 flex flex-col gap-3 border-t border-mist/8 pt-3">
              {comments.map((c) => (
                <div key={c.id} className="text-sm">
                  <span className="text-candle/70">{c.author}</span>
                  <span className="mx-2 text-xs text-mist/25">
                    {agoFa(c.created_at)}
                  </span>
                  <p className="mt-1 leading-6 text-mist/75">{c.body}</p>
                </div>
              ))}

              {canWrite && (
                <div className="flex gap-2">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    maxLength={300}
                    placeholder="نظرت..."
                    className="flex-1 rounded-xl bg-night/50 px-3 py-2 text-sm ring-1 ring-mist/10 outline-none placeholder:text-mist/25 focus:ring-candle/40"
                  />
                  <button
                    disabled={busy || !text.trim()}
                    onClick={send}
                    className="rounded-xl bg-candle/15 px-4 text-sm text-candle ring-1 ring-candle/25 disabled:opacity-40"
                  >
                    ↵
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}