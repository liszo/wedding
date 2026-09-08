"use client";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { KINDS, type Kind } from "@/lib/reactions";
import type { ReactionState } from "@/lib/posts";
import { toFa } from "@/lib/fa";
import Sticker from "./Sticker";

/**
 * Reactions, the way a messaging app does them: only the ones people have
 * actually used are shown, as small chips under the message, and the rest live
 * behind a single button. The old wall printed all four chips at zero on every
 * post, which is a form, not a conversation.
 */
/** the sticky header's height plus the picker's own — below this it must flip */
const HEADROOM = 112;

export default function ChatReactions({
  postId,
  initial,
  canReact,
  align,
}: {
  postId: string;
  initial: ReactionState[];
  canReact: boolean;
  align: "start" | "end";
}) {
  const [state, setState] = useState(initial);
  const [picking, setPicking] = useState(false);
  /** flipped below the button when there is no room above it */
  const [below, setBelow] = useState(false);
  const openBtn = useRef<HTMLButtonElement>(null);

  /**
   * The picker opens upward, which puts it behind the sticky header for any
   * message near the top of the screen. Measure at the moment of opening and
   * drop it underneath instead when the room is not there.
   */
  function togglePicker() {
    setPicking((p) => {
      if (p) return false;
      const top = openBtn.current?.getBoundingClientRect().top ?? 0;
      setBelow(top < HEADROOM);
      return true;
    });
  }

  async function toggle(kind: Kind) {
    if (!canReact) return;
    setPicking(false);

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

  const used = state.filter((r) => r.count > 0);

  return (
    <div
      className={`relative flex flex-wrap items-center gap-1 ${
        align === "end" ? "flex-row-reverse" : ""
      }`}
    >
      {used.map((r) => (
        <button
          key={r.kind}
          onClick={() => toggle(r.kind)}
          disabled={!canReact}
          aria-pressed={r.mine}
          className={`flex items-center gap-1 rounded-full border px-2 py-[3px] transition ${
            r.mine ? "border-umber bg-sunk" : "border-line bg-white"
          } ${canReact ? "hover:border-umber" : "cursor-default"}`}
        >
          <motion.span
            key={`${r.kind}-${r.mine}`}
            initial={{ scale: 0.7 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="flex"
          >
            <Sticker id={r.kind} size={15} />
          </motion.span>
          <span className="tabular text-[10px] text-muted">{toFa(r.count)}</span>
        </button>
      ))}

      {canReact && (
        <button
          ref={openBtn}
          onClick={togglePicker}
          aria-label="واکنش"
          aria-expanded={picking}
          className="flex h-[21px] w-[21px] items-center justify-center rounded-full border border-line bg-white text-[11px] leading-none text-muted transition hover:border-umber"
        >
          ☺
        </button>
      )}

      <AnimatePresence>
        {picking && (
          <motion.div
            initial={{ opacity: 0, y: below ? -6 : 6, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: below ? -6 : 6, scale: 0.94 }}
            transition={{ duration: 0.16 }}
            className={`absolute z-20 flex gap-1 rounded-full border border-line bg-white px-2 py-1.5 shadow-[0_10px_24px_-10px_rgba(46,42,38,0.4)] ${
              below ? "top-full mt-1.5" : "bottom-full mb-1.5"
            } ${align === "end" ? "end-0" : "start-0"}`}
          >
            {KINDS.map((k) => (
              <button
                key={k}
                onClick={() => toggle(k)}
                aria-label={k}
                className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-sunk active:scale-90"
              >
                <Sticker id={k} size={22} />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
