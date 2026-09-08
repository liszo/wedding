"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import type { ChatItem } from "@/lib/chat";
import { dayKey, dayLabel } from "@/lib/chat";
import { STICKERS } from "@/content/stickers";
import { compressImage } from "@/lib/compress";
import { coupleNames } from "@/content/config";
import { toFa } from "@/lib/fa";
import ChatBubble from "./ChatBubble";
import Sticker from "./Sticker";
import LostLinkModal from "./LostLinkModal";

/**
 * The wall, as a room rather than a feed.
 *
 * The whole timeline is client-side because the composer needs to know which
 * message you are replying to, and a reply target that lives in a server
 * component would have to be lifted into a module store to reach it. Passing
 * the messages down as props keeps it plain React state; the page stays a
 * server component that fetches, and `router.refresh()` re-fetches.
 */
export default function ChatRoom({
  items,
  signedIn,
  admin,
  guestName,
}: {
  items: ChatItem[];
  signedIn: boolean;
  admin: boolean;
  guestName?: string;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const [text, setText] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [replyTo, setReplyTo] = useState<ChatItem | null>(null);
  const [tray, setTray] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  /**
   * Land at the newest message, the way opening a chat does — and stay there
   * while the page is still growing.
   *
   * Scrolling once on mount is not enough: the photographs have no intrinsic
   * size stored, so each one that decodes pushes the log taller and leaves the
   * newest message somewhere off the bottom of the screen. A ResizeObserver
   * keeps re-anchoring until the guest takes over by scrolling themselves.
   *
   * `instant` because sliding through the whole history on every load is not
   * arriving, it is travelling.
   */
  useEffect(() => {
    const log = logRef.current;
    if (!log) return;

    let held = false;
    const release = () => {
      held = true;
    };
    // The whole document, not the end marker: scrollIntoView would align the
    // marker with the bottom of the viewport and leave the dock's own height
    // still below it, so the newest message sat behind the composer.
    const anchor = () => {
      if (!held) window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
    };

    anchor();
    const ro = new ResizeObserver(anchor);
    ro.observe(log);

    // any deliberate scroll hands control back to the reader
    for (const ev of ["wheel", "touchmove", "keydown"] as const)
      window.addEventListener(ev, release, { passive: true });

    const stop = window.setTimeout(release, 4000);

    return () => {
      ro.disconnect();
      window.clearTimeout(stop);
      for (const ev of ["wheel", "touchmove", "keydown"] as const)
        window.removeEventListener(ev, release);
    };
  }, []);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setErr("");
    try {
      const out = await compressImage(f);
      setBlob(out);
      setPreview((old) => {
        if (old) URL.revokeObjectURL(old);
        return URL.createObjectURL(out);
      });
    } catch {
      setErr("این عکس باز نشد. عکس دیگری انتخاب کن.");
    }
  }

  function clearImage() {
    setBlob(null);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
    if (fileRef.current) fileRef.current.value = "";
  }

  /** A reply goes to the comments endpoint; everything else is a new message. */
  async function send(sticker?: string) {
    if (busy) return;
    if (!sticker && !text.trim() && !blob) return;

    setBusy(true);
    setErr("");

    try {
      let res: Response;

      if (replyTo?.postId) {
        res = await fetch("/api/comments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            sticker
              ? { post_id: replyTo.postId, sticker }
              : { post_id: replyTo.postId, body: text }
          ),
        });
      } else {
        const form = new FormData();
        if (sticker) form.set("sticker", sticker);
        else {
          form.set("body", text);
          if (blob)
            form.set("image", new File([blob], "photo.jpg", { type: "image/jpeg" }));
        }
        res = await fetch("/api/posts", { method: "POST", body: form });
      }

      const j = await res.json().catch(() => ({}));
      if (res.ok) {
        setText("");
        setReplyTo(null);
        setTray(false);
        clearImage();
        router.refresh();
      } else {
        setErr(j.message ?? `خطا (${res.status})`);
      }
    } catch {
      setErr("خطا در ارتباط. دوباره تلاش کن.");
    } finally {
      setBusy(false);
    }
  }

  function reply(item: ChatItem) {
    setReplyTo(item);
    inputRef.current?.focus();
  }

  const canSend = Boolean(text.trim() || blob);

  return (
    <div className="chat-app">
      <header className="chat-top">
        <Link href="/" aria-label="بازگشت به دعوت‌نامه" className="chat-back">
          <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-none stroke-current stroke-[1.6]">
            {/* a path, not «: the chevron characters are bidi-mirrored and
                would point the wrong way in an RTL document */}
            <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        <span aria-hidden className="chat-top-avatar">
          <Sticker id="heart" size={19} />
        </span>

        <div className="min-w-0">
          <h1 className="truncate text-[14px] text-ink">دیوار ما</h1>
          <p className="truncate text-[10.5px] text-muted">
            {items.length > 0
              ? `${toFa(items.length)} پیام · ${coupleNames}`
              : coupleNames}
          </p>
        </div>
      </header>

      <div ref={logRef} className="chat-log">
        {items.length === 0 ? (
          <div className="py-20 text-center">
            <Sticker id="toast" size={72} />
            <p className="mt-4 text-[13px] leading-8 text-muted">
              هنوز پیامی نیست.
              <br />
              اولین نفر باش.
            </p>
          </div>
        ) : (
          items.map((item, i) => {
            const prev = i > 0 ? items[i - 1] : null;
            const newDay = !prev || dayKey(prev.at) !== dayKey(item.at);
            // a run is the same person talking without interruption on the
            // same day; only the first of a run is captioned
            const showAuthor =
              newDay || !prev || prev.author !== item.author || Boolean(item.quote);

            return (
              <div key={item.id} className="contents">
                {newDay && (
                  <div className="chat-day">
                    <span>{dayLabel(item.at)}</span>
                  </div>
                )}
                <ChatBubble
                  item={item}
                  showAuthor={showAuthor}
                  canReact={signedIn}
                  admin={admin}
                  onReply={reply}
                />
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {signedIn ? (
        <div className="chat-dock">
          <AnimatePresence>
            {replyTo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="chat-replying">
                  <div className="min-w-0">
                    <span className="chat-quote-who">
                      پاسخ به {replyTo.author}
                    </span>
                    <span className="chat-quote-text">
                      {replyTo.body ?? (replyTo.sticker ? "استیکر" : "عکس")}
                    </span>
                  </div>
                  <button
                    onClick={() => setReplyTo(null)}
                    aria-label="بی‌خیال پاسخ"
                    className="shrink-0 px-2 text-lg leading-none text-muted"
                  >
                    ×
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {preview && (
            <div className="chat-attach">
              <img src={preview} alt="پیش‌نمایش عکس انتخاب‌شده" />
              <button onClick={clearImage} aria-label="حذف عکس">
                ×
              </button>
            </div>
          )}

          <AnimatePresence>
            {tray && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="chat-tray">
                  {STICKERS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => send(s.id)}
                      aria-label={s.label}
                      title={s.label}
                      className="flex aspect-square items-center justify-center rounded-2xl transition hover:bg-sunk active:scale-90"
                    >
                      <Sticker id={s.id} size={44} />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="chat-bar">
            <button
              onClick={() => setTray((t) => !t)}
              aria-label="استیکر"
              aria-expanded={tray}
              className={`chat-icon ${tray ? "chat-icon-on" : ""}`}
            >
              <Sticker id="laugh" size={21} />
            </button>

            <button
              onClick={() => fileRef.current?.click()}
              aria-label="افزودن عکس"
              className="chat-icon"
            >
              <svg viewBox="0 0 24 24" aria-hidden className="h-[19px] w-[19px] fill-none stroke-current stroke-[1.5]">
                <path
                  d="M21 15V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10M3 16l4.5-4.5a2 2 0 0 1 2.8 0L15 16m3 1v6m3-3h-6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={pick}
              className="hidden"
            />

            <textarea
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              maxLength={500}
              placeholder="پیامت را بنویس..."
              aria-label="نوشتن پیام"
              className="chat-input"
            />

            <button
              onClick={() => send()}
              disabled={busy || !canSend}
              aria-label="ارسال"
              className="chat-send"
            >
              <svg viewBox="0 0 24 24" aria-hidden className="h-[18px] w-[18px] fill-current">
                {/* points along the reading direction: in RTL the whole bar is
                    mirrored, so the glyph is flipped with it by the stylesheet */}
                <path d="M3.4 20.4 21 12 3.4 3.6 3.4 10.2 15.6 12 3.4 13.8Z" />
              </svg>
            </button>
          </div>

          {err && (
            <p role="status" className="px-4 pb-2 text-center text-[11.5px] text-crimson">
              {err}
            </p>
          )}
        </div>
      ) : (
        <div className="chat-dock">
          <div className="px-4 py-5 text-center">
            <p className="mb-3 text-[12.5px] leading-7 text-muted">
              {guestName
                ? "برای نوشتن، دوباره با لینک دعوتت وارد شو."
                : "برای نوشتن، با لینک دعوتت وارد شو."}
            </p>
            <LostLinkModal />
          </div>
        </div>
      )}
    </div>
  );
}
