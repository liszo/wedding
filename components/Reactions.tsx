"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { GLYPH, type Kind } from "@/lib/reactions";
import type { ReactionState } from "@/lib/posts";
import { toFa } from "@/lib/fa";

export default function Reactions({
  postId,
  initial,
  canReact,
}: {
  postId: string;
  initial: ReactionState[];
  canReact: boolean;
}) {
  const [state, setState] = useState(initial);

  async function toggle(kind: Kind) {
    if (!canReact) return;

    const before = state;
    setState((s) =>
      s.map((r) =>
        r.kind === kind
          ? { ...r, mine: !r.mine, count: r.count + (r.mine ? -1 : 1) }
          : r
      )
    );

    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, kind }),
      });
      if (!res.ok) setState(before);
    } catch {
      setState(before);
    }
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {state.map((r) => (
        <button
          key={r.kind}
          onClick={() => toggle(r.kind)}
          disabled={!canReact}
          aria-pressed={r.mine}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition ${
            r.mine
              ? "bg-candle/20 ring-1 ring-candle/40"
              : "bg-mist/5 ring-1 ring-mist/10"
          } ${canReact ? "hover:bg-mist/10" : "cursor-default opacity-60"}`}
        >
          <motion.span
            key={`${r.kind}-${r.mine}`}
            initial={{ scale: 0.7 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
          >
            {GLYPH[r.kind]}
          </motion.span>
          {r.count > 0 && (
            <span className="tabular text-xs text-mist/60">
              {toFa(r.count)}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}