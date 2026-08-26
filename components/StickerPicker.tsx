"use client";
import { motion, AnimatePresence } from "motion/react";
import { STICKERS } from "@/content/stickers";
import Sticker from "./Sticker";

export default function StickerPicker({
  open,
  onPick,
}: {
  open: boolean;
  onPick: (id: string) => void;
}) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="mt-2 grid grid-cols-6 gap-2 rounded-2xl bg-night/50 p-3 ring-1 ring-mist/10">
            {STICKERS.map((s) => (
              <button
                key={s.id}
                onClick={() => onPick(s.id)}
                title={s.label}
                aria-label={s.label}
                className="flex aspect-square items-center justify-center rounded-xl transition hover:bg-candle/15 active:scale-90"
              >
                <Sticker id={s.id} size={30} />
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}