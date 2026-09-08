"use client";
import { motion } from "motion/react";
import type { ChatItem } from "@/lib/chat";
import { avatarTone, clockFa, initial } from "@/lib/chat";
import Sticker from "./Sticker";
import ChatReactions from "./ChatReactions";
import DeletePost from "./DeletePost";

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
}: {
  item: ChatItem;
  /** false when the previous message was from the same person */
  showAuthor: boolean;
  canReact: boolean;
  admin: boolean;
  onReply: (item: ChatItem) => void;
}) {
  const { mine } = item;

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
          className={
            bare
              ? ""
              : `chat-bubble ${mine ? "chat-mine" : "chat-theirs"} ${
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
              <Sticker id={item.sticker} size={104} />
            </div>
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
