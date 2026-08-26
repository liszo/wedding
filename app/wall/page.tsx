import Link from "next/link";
import { getGuest } from "@/lib/guest";
import { isAdmin } from "@/lib/admin";
import { listPosts } from "@/lib/posts";
import Composer from "@/components/Composer";
import PostCard from "@/components/PostCard";
import LostLinkModal from "@/components/LostLinkModal";

export const dynamic = "force-dynamic";

export default async function Wall() {
  const [guest, admin] = await Promise.all([getGuest(), isAdmin()]);
  const posts = await listPosts(guest?.id ?? null);

  return (
    <main className="mx-auto max-w-md px-5 py-10">
      <header className="mb-8 flex items-baseline justify-between">
        <h1 className="text-lg text-candle">دیوار ما</h1>
        <Link href="/" className="text-xs text-mist/40 hover:text-mist/70">
          دعوت‌نامه
        </Link>
      </header>

      {guest ? (
        <Composer />
      ) : (
        <div className="rounded-3xl bg-raised/60 p-6 text-center ring-1 ring-mist/8">
          <p className="mb-3 text-sm text-mist/60">
            برای نوشتن، با لینک دعوتت وارد شو.
          </p>
          <LostLinkModal />
        </div>
      )}

      <div className="mt-8 flex flex-col gap-4">
        {posts.length === 0 && (
          <p className="py-16 text-center text-sm text-mist/30">
            هنوز چیزی نوشته نشده. اولین نفر باش.
          </p>
        )}
        {posts.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            admin={admin}
            signedIn={Boolean(guest)}
          />
        ))}
      </div>
    </main>
  );
}