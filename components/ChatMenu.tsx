"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import type { ChatItem } from "@/lib/chat";

export type MenuAction = "reply" | "edit" | "copy" | "delete";

/**
 * The sheet a message opens on right-click or long-press.
 *
 * It renders into <body>. `position: fixed` resolves against the nearest
 * transformed ancestor, and every bubble is inside a motion element that has
 * one — in place, the sheet would be pinned to the message instead of to the
 * screen.
 *
 * No forward: there is one room and everyone is already in it.
 */
export default function ChatMenu({
  item,
  canModerate,
  onPick,
  onClose,
}: {
  item: ChatItem | null;
  /** the couple, or an admin: may delete anyone's message */
  canModerate: boolean;
  onPick: (action: MenuAction) => void;
  onClose: () => void;
}) {
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!item) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sheet.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [item, onClose]);

  const canCopy = Boolean(item?.body);
  // only text can be edited: there is nothing to type over a sticker, a
  // photograph or a voice note
  const canEdit = Boolean(item?.mine && item?.body);
  const canDelete = Boolean(item?.mine) || canModerate;

  const sheetUi = (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          dir="rtl"
          className="fixed inset-0 z-[900] flex items-end justify-center bg-ink/45 p-3 backdrop-blur-[2px]"
        >
          <motion.div
            ref={sheet}
            tabIndex={-1}
            role="dialog"
            aria-label="کارهای پیام"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="chat-sheet"
          >
            <p className="chat-sheet-peek">
              {item.body ??
                (item.sticker ? "استیکر" : item.voice ? "پیام صوتی" : "عکس")}
            </p>

            <button onClick={() => onPick("reply")}>
              <span aria-hidden>↩︎</span> پاسخ
            </button>
            {canCopy && (
              <button onClick={() => onPick("copy")}>
                <span aria-hidden>⧉</span> رونوشت
              </button>
            )}
            {canEdit && (
              <button onClick={() => onPick("edit")}>
                <span aria-hidden>✎</span> ویرایش
              </button>
            )}
            {canDelete && (
              <button onClick={() => onPick("delete")} className="chat-sheet-bad">
                <span aria-hidden>🗑</span>{" "}
                {item.mine ? "حذف" : "حذف این پیام"}
              </button>
            )}

            <button onClick={onClose} className="chat-sheet-cancel">
              بی‌خیال
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === "undefined") return null;
  return createPortal(sheetUi, document.body);
}
