"use client";
import { useEffect, useState } from "react";
import { STICKERS } from "@/content/stickers";
import Sticker from "./Sticker";

/**
 * The panel behind the sticker button: emoji, the couple's own stickers, and
 * GIF search — the three Telegram offers, in that order.
 *
 * Emoji are *typed*, not sent. Tapping one drops it into the message you are
 * writing, the way an emoji keyboard behaves; stickers and GIFs are whole
 * messages and send on the tap.
 */

/** A wedding's worth of emoji, grouped roughly the way you would reach for them. */
const EMOJI = [
  "❤️", "🤍", "💍", "💐", "🌸", "🌹", "✨", "🎉",
  "🥂", "🍰", "🎂", "🕊️", "😍", "🥹", "😂", "🙌",
  "👏", "💃", "🕺", "🎶", "📸", "🤩", "😘", "🙏",
  "🌙", "⭐", "🥳", "💫", "🎊", "😊", "🫶", "💞",
];

type Gif = { id: string; preview: string; url: string; alt: string };

type Tab = "emoji" | "sticker" | "gif";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "emoji", label: "ایموجی", icon: "😊" },
  { id: "sticker", label: "استیکر", icon: "🖼️" },
  { id: "gif", label: "گیف", icon: "GIF" },
];

export default function ChatTray({
  onEmoji,
  onSticker,
  onGif,
}: {
  onEmoji: (emoji: string) => void;
  onSticker: (id: string) => void;
  onGif: (url: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("sticker");
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [gifState, setGifState] = useState<"idle" | "loading" | "off" | "error">(
    "idle"
  );

  // debounced, and only once the GIF tab is actually open — no point searching
  // a tab nobody has looked at
  useEffect(() => {
    if (tab !== "gif") return;
    let alive = true;

    // "loading" is set inside the timer rather than in the effect body: it is
    // the search that is starting, not the render, and setting state
    // synchronously here would cost a cascading render on every keystroke
    const t = window.setTimeout(async () => {
      if (!alive) return;
      setGifState("loading");
      try {
        const res = await fetch(`/api/gifs?q=${encodeURIComponent(query)}`);
        const json = await res.json().catch(() => ({}));
        if (!alive) return;
        if (res.status === 501) return setGifState("off");
        if (!res.ok) return setGifState("error");
        setGifs(json.gifs ?? []);
        setGifState("idle");
      } catch {
        if (alive) setGifState("error");
      }
    }, query ? 350 : 0);

    return () => {
      alive = false;
      window.clearTimeout(t);
    };
  }, [tab, query]);

  return (
    <div className="chat-tray">
      <div className="chat-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`chat-tab ${tab === t.id ? "chat-tab-on" : ""}`}
          >
            <span aria-hidden className="chat-tab-icon">
              {t.icon}
            </span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "emoji" && (
        <div className="chat-emoji-grid">
          {EMOJI.map((e) => (
            <button
              key={e}
              onClick={() => onEmoji(e)}
              aria-label={e}
              className="chat-emoji"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {tab === "sticker" && (
        <div className="chat-sticker-grid">
          {STICKERS.map((s) => (
            <button
              key={s.id}
              onClick={() => onSticker(s.id)}
              aria-label={s.label}
              title={s.label}
              className="chat-sticker"
            >
              <Sticker id={s.id} size={78} />
            </button>
          ))}
        </div>
      )}

      {tab === "gif" && (
        <div className="chat-gif">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جست‌وجوی گیف..."
            aria-label="جست‌وجوی گیف"
            className="chat-gif-search"
          />

          {gifState === "off" ? (
            <p className="chat-gif-note">
              جست‌وجوی گیف هنوز فعال نیست. کلید Tenor را در
              <code className="mx-1 text-[10.5px]">TENOR_API_KEY</code>
              بگذارید.
            </p>
          ) : gifState === "error" ? (
            <p className="chat-gif-note">گیف‌ها نیامدند. دوباره تلاش کن.</p>
          ) : gifState === "loading" && gifs.length === 0 ? (
            <p className="chat-gif-note">در حال گشتن...</p>
          ) : (
            <div className="chat-gif-grid">
              {gifs.map((g) => (
                <button key={g.id} onClick={() => onGif(g.url)} title={g.alt}>
                  <img src={g.preview} alt={g.alt} loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
