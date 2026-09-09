"use client";
import { useRef } from "react";
import { motion } from "motion/react";
import type { ChatItem } from "@/lib/chat";
import { avatarTone, clockFa, initial } from "@/lib/chat";
import Sticker from "./Sticker";
import ChatReactions from "./ChatReactions";
import VoiceNote from "./VoiceNote";
import DeletePost from "./DeletePost";

/** how long a touch has to rest before it counts as a long press */
const HOLD_MS = 420;

/**
 * One message.
 *
 * Everything is aligned logically, never with `left`/`right`: the page is RTL,
 * so `ms-auto` puts your own messages against the near edge and `me-auto` puts
 * everyone else's against the far one, and the same code would be correct if
 * the document ever flipped.
 */
export default function ChatBubble({
  item,
  showAuthor,
  canReact,
  admin,
  onReply,
  onMenu,
}: {
  item: ChatItem;
  /** false when the previous message was from the same person */
  showAuthor: boolean;
  canReact: boolean;
  admin: boolean;
  onReply: (item: ChatItem) => void;
  onMenu: (item: ChatItem) => void;
}) {
  const { mine } = item;
  const hold = useRef<number | null>(null);

  /**
   * Right-click on a pointer, press-and-hold on a touchscreen. The timer is
   * cancelled by movement as well as by lifting, so scrolling past a message
   * does not open its menu — a hold that survives a scroll is not a hold.
   */
  function startHold() {
    clearHold();
    hold.current = window.setTimeout(() => onMenu(item), HOLD_MS);
  }
  function clearHold() {
    if (hold.current !== null) {
      window.clearTimeout(hold.current);
      hold.current = null;
    }
  }

  const press = {
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault();
      onMenu(item);
    },
    onTouchStart: startHold,
    onTouchEnd: clearHold,
    onTouchMove: clearHold,
    onTouchCancel: clearHold,
  };

  // A sticker is the whole message: no bubble, no paper behind it. Bubbling a
  // sticker is what makes a chat look like a form.
  const bare = Boolean(item.sticker);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      data-reveal
      className={`flex max-w-[86%] items-end gap-2 ${
        mine ? "ms-auto flex-row-reverse" : "me-auto"
      }`}
    >
      {/* the avatar only appears on the first of a run, and never on your own
          messages — you know who you are */}
      {!mine &&
        (showAuthor ? (
          <span
            aria-hidden
            style={{ background: avatarTone(item.author) }}
            className="mb-0.5 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[11px] text-white"
          >
            {initial(item.author)}
          </span>
        ) : (
          <span aria-hidden className="w-[26px] shrink-0" />
        ))}

      <div className={`min-w-0 ${mine ? "items-end" : "items-start"} flex flex-col`}>
        <div
          {...press}
          className={
            bare
              ? "chat-press"
              : `chat-bubble chat-press ${mine ? "chat-mine" : "chat-theirs"} ${
                  showAuthor ? (mine ? "chat-tail-mine" : "chat-tail-theirs") : ""
                }`
          }
        >
          {!mine && showAuthor && !bare && (
            <p
              style={{ color: avatarTone(item.author) }}
              className="mb-1 text-[11.5px] font-medium"
            >
              {item.author}
            </p>
          )}

          {item.quote && (
            <div className="chat-quote">
              <span className="chat-quote-who">{item.quote.author}</span>
              <span className="chat-quote-text">{item.quote.text}</span>
            </div>
          )}

          {item.sticker ? (
            <div className={mine ? "text-end" : "text-start"}>
              <Sticker id={item.sticker} size={148} />
            </div>
          ) : item.voice ? (
            <VoiceNote src={item.voice} mine={mine} />
          ) : (
            <>
              {item.photo && (
                <img
                  src={item.photo}
                  alt={`عکسی از ${item.author}`}
                  loading="lazy"
                  decoding="async"
                  className="chat-photo"
                />
              )}
              {item.body && <p className="chat-text">{item.body}</p>}
            </>
          )}

          <div className={`chat-meta ${bare ? "chat-meta-bare" : ""}`}>
            {bare && !mine && showAuthor && (
              <span className="text-muted">{item.author}</span>
            )}
            <time dateTime={item.at} className="tabular">
              {clockFa(item.at)}
            </time>
            {admin && item.postId && <DeletePost id={item.postId} />}
          </div>
        </div>

        <div
          className={`mt-1 flex items-center gap-2 ${
            mine ? "flex-row-reverse" : ""
          }`}
        >
          {item.postId && (
            <ChatReactions
              postId={item.postId}
              initial={item.reactions}
              canReact={canReact}
              align={mine ? "end" : "start"}
            />
          )}
          {canReact && item.postId && (
            <button
              onClick={() => onReply(item)}
              className="text-[10.5px] text-muted/70 transition hover:text-umber"
            >
              پاسخ
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
