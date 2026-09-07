import type { Metadata } from "next";
import Link from "next/link";
import { getGuest } from "@/lib/guest";
import { isAdmin } from "@/lib/admin";
import { listPosts } from "@/lib/posts";
import Composer from "@/components/Composer";
import PostCard from "@/components/PostCard";
import LostLinkModal from "@/components/LostLinkModal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "دیوار ما",
};

export default async function Wall() {
  const [guest, admin] = await Promise.all([getGuest(), isAdmin()]);
  const posts = await listPosts(guest?.id ?? null);

  return (
    <main className="frame grain min-h-dvh px-5 py-9">
      <header className="relative z-2 mb-8 text-center">
        <p className="label">برای شقایق و رامین</p>
        <h1 className="nastaliq mt-1 text-[26px] text-ink">دیوار ما</h1>
        <div aria-hidden className="rule-soft mt-3" />
        <Link
          href="/"
          className="mt-3 inline-block text-xs text-muted underline underline-offset-4 transition hover:text-umber"
        >
          بازگشت به دعوت‌نامه
        </Link>
      </header>

      <div className="relative z-2">
        {guest ? (
          <Composer />
        ) : (
          <div className="leaf rounded-[20px] p-6 text-center">
            <p className="mb-3 text-sm leading-7 text-muted">
              برای نوشتن، با لینک دعوتت وارد شو.
            </p>
            <LostLinkModal />
          </div>
        )}

        <div className="mt-8 flex flex-col gap-4">
          {posts.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted">
              هنوز چیزی نوشته نشده. اولین نفر باش.
            </p>
          ) : (
            posts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                admin={admin}
                signedIn={Boolean(guest)}
              />
            ))
          )}
        </div>

        <div aria-hidden className="rule mt-12" />
      </div>
    </main>
  );
}
