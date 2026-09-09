"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import type { ChatItem } from "@/lib/chat";
import { dayKey, dayLabel } from "@/lib/chat";
import { compressImage } from "@/lib/compress";
import { coupleNames } from "@/content/config";
import { toFa, pad2 } from "@/lib/fa";
import ChatBubble from "./ChatBubble";
import ChatTray from "./ChatTray";
import ChatMenu, { type MenuAction } from "./ChatMenu";
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
  const [editing, setEditing] = useState<ChatItem | null>(null);
  const [menu, setMenu] = useState<ChatItem | null>(null);
  const [tray, setTray] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const rec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

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

  /**
   * A reply goes to the comments endpoint, an edit to the message endpoint,
   * and everything else is a new post. `attach` carries whichever of sticker,
   * GIF or recorded audio prompted the send — none of them go through the
   * text box, so none of them can wait for it.
   */
  async function send(attach?: {
    sticker?: string;
    gif?: string;
    audio?: Blob;
  }) {
    if (busy) return;
    const has = attach?.sticker || attach?.gif || attach?.audio;
    if (!has && !text.trim() && !blob) return;

    setBusy(true);
    setErr("");

    try {
      let res: Response;

      if (editing) {
        res = await fetch("/api/message", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editing.id,
            kind: editing.kind,
            body: text,
          }),
        });
      } else if (replyTo?.postId && !attach?.gif && !attach?.audio) {
        // comments carry text or a sticker, and nothing else
        res = await fetch("/api/comments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            attach?.sticker
              ? { post_id: replyTo.postId, sticker: attach.sticker }
              : { post_id: replyTo.postId, body: text }
          ),
        });
      } else {
        const form = new FormData();
        if (attach?.sticker) form.set("sticker", attach.sticker);
        else if (attach?.gif) form.set("gif", attach.gif);
        else if (attach?.audio)
          form.set(
            "audio",
            new File([attach.audio], "voice.webm", {
              type: attach.audio.type || "audio/webm",
            })
          );
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
        setEditing(null);
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
    setEditing(null);
    setReplyTo(item);
    inputRef.current?.focus();
  }

  async function onMenuPick(action: MenuAction) {
    const item = menu;
    setMenu(null);
    if (!item) return;

    if (action === "reply") return reply(item);

    if (action === "copy") {
      try {
        await navigator.clipboard.writeText(item.body ?? "");
      } catch {
        setErr("رونوشت نشد.");
      }
      return;
    }

    if (action === "edit") {
      setReplyTo(null);
      setEditing(item);
      setText(item.body ?? "");
      inputRef.current?.focus();
      return;
    }

    if (action === "delete") {
      setBusy(true);
      try {
        const res = await fetch("/api/message", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.id, kind: item.kind }),
        });
        if (res.ok) router.refresh();
        else {
          const j = await res.json().catch(() => ({}));
          setErr(j.message ?? "حذف نشد.");
        }
      } catch {
        setErr("خطا در ارتباط.");
      } finally {
        setBusy(false);
      }
    }
  }

  /* --- voice ------------------------------------------------------------ */

  async function startRecording() {
    if (recording) return;
    setErr("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunks.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      mr.onstop = () => {
        // the tracks have to be stopped by hand or the browser keeps showing
        // the recording indicator long after the message has gone
        for (const t of stream.getTracks()) t.stop();
      };
      rec.current = mr;
      mr.start();
      setSeconds(0);
      setRecording(true);
    } catch {
      setErr("به میکروفون دسترسی نداریم.");
    }
  }

  function stopRecording(keep: boolean) {
    const mr = rec.current;
    if (!mr) return;
    rec.current = null;
    setRecording(false);

    mr.addEventListener(
      "stop",
      () => {
        if (!keep || chunks.current.length === 0) return;
        const audio = new Blob(chunks.current, { type: mr.mimeType || "audio/webm" });
        chunks.current = [];
        if (audio.size > 0) send({ audio });
      },
      { once: true }
    );
    mr.stop();
  }

  useEffect(() => {
    if (!recording) return;
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [recording]);

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
                  onMenu={signedIn ? setMenu : () => {}}
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
            {(replyTo || editing) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="chat-replying">
                  <div className="min-w-0">
                    <span className="chat-quote-who">
                      {editing ? "ویرایش پیام" : `پاسخ به ${replyTo!.author}`}
                    </span>
                    <span className="chat-quote-text">
                      {(editing ?? replyTo)!.body ??
                        ((editing ?? replyTo)!.sticker ? "استیکر" : "عکس")}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setReplyTo(null);
                      if (editing) setText("");
                      setEditing(null);
                    }}
                    aria-label="بی‌خیال"
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
                <ChatTray
                  onEmoji={(e) => {
                    setText((t) => t + e);
                    inputRef.current?.focus();
                  }}
                  onSticker={(id) => send({ sticker: id })}
                  onGif={(url) => send({ gif: url })}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="chat-bar">
            {/* A sticker mark, not one of the couple's own stickers: the
                button says what the panel is, and the panel holds the
                stickers. */}
            <button
              onClick={() => setTray((t) => !t)}
              aria-label="ایموجی، استیکر و گیف"
              aria-expanded={tray}
              className={`chat-icon ${tray ? "chat-icon-on" : ""}`}
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden
                className="h-[21px] w-[21px] fill-none stroke-current stroke-[1.5]"
              >
                <path
                  d="M21 12a9 9 0 1 0-9 9c.6 0 1.2-.06 1.8-.18L21 13.8c.12-.58.18-1.18.18-1.8Z"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.6 21c0-3.6.9-5.4 4.2-5.4H21"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M8.5 9.5h.01M15 9.5h.01" strokeLinecap="round" />
                <path d="M8.6 14.2a4 4 0 0 0 5.2.6" strokeLinecap="round" />
              </svg>
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

            {/* Send when there is something to send, record when there is not
                — the swap a messaging app makes, so one button is enough. */}
            {canSend || editing ? (
              <button
                onClick={() => send()}
                disabled={busy}
                aria-label={editing ? "ذخیره" : "ارسال"}
                className="chat-send"
              >
                {editing ? (
                  <svg viewBox="0 0 24 24" aria-hidden className="h-[18px] w-[18px] fill-none stroke-current stroke-[2]">
                    <path d="m5 12.5 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden
                    className="chat-plane h-[18px] w-[18px] fill-current"
                  >
                    <path d="M3.4 20.4 21 12 3.4 3.6 3.4 10.2 15.6 12 3.4 13.8Z" />
                  </svg>
                )}
              </button>
            ) : (
              <button
                onClick={() => (recording ? stopRecording(true) : startRecording())}
                disabled={busy}
                aria-label={recording ? "پایان و ارسال صدا" : "ضبط پیام صوتی"}
                className={`chat-send ${recording ? "chat-send-rec" : ""}`}
              >
                {recording ? (
                  <svg viewBox="0 0 24 24" aria-hidden className="h-[15px] w-[15px] fill-current">
                    <rect x="5" y="5" width="14" height="14" rx="2.5" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden className="h-[19px] w-[19px] fill-none stroke-current stroke-[1.6]">
                    <rect x="9" y="3" width="6" height="11" rx="3" />
                    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            )}
          </div>

          {recording && (
            <div className="chat-rec">
              <span aria-hidden className="chat-rec-dot" />
              <span className="tabular">
                {toFa(Math.floor(seconds / 60))}:{toFa(pad2(seconds % 60))}
              </span>
              <span className="flex-1 text-muted">در حال ضبط...</span>
              <button onClick={() => stopRecording(false)} className="text-crimson">
                لغو
              </button>
            </div>
          )}

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

      <ChatMenu item={menu} onPick={onMenuPick} onClose={() => setMenu(null)} />
    </div>
  );
}
