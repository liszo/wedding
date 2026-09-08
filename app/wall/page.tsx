import type { Metadata } from "next";
import { getGuest } from "@/lib/guest";
import { isAdmin } from "@/lib/admin";
import { listPosts } from "@/lib/posts";
import { buildTimeline } from "@/lib/chat";
import ChatRoom from "@/components/ChatRoom";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "دیوار ما",
};

/**
 * The wall is a room the guests talk in, so the page does nothing but fetch
 * and hand the conversation over. Everything interactive lives in ChatRoom,
 * which needs to be one client component: the composer has to know which
 * message you are replying to.
 */
export default async function Wall() {
  const [guest, admin] = await Promise.all([getGuest(), isAdmin()]);
  const posts = await listPosts(guest?.id ?? null);

  return (
    <ChatRoom
      items={buildTimeline(posts)}
      signedIn={Boolean(guest)}
      admin={admin}
      guestName={guest?.name}
    />
  );
}
