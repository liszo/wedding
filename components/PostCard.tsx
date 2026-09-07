import type { WallPost } from "@/lib/posts";
import { agoFa } from "@/lib/time";
import DeletePost from "./DeletePost";
import Reactions from "./Reactions";
import Comments from "./Comments";

export default function PostCard({
  post,
  admin,
  signedIn,
}: {
  post: WallPost;
  admin: boolean;
  signedIn: boolean;
}) {
  return (
    <article className="leaf rounded-[20px] p-5">
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <span className="text-sm text-umber">{post.author}</span>
        <div className="flex items-center gap-3">
          <time dateTime={post.created_at} className="text-xs text-muted/75">
            {agoFa(post.created_at)}
          </time>
          {admin && <DeletePost id={post.id} />}
        </div>
      </header>

      {post.body && (
        <p className="whitespace-pre-wrap text-sm leading-7 text-ink">
          {post.body}
        </p>
      )}

      {post.image_url && (
        <img
          src={post.image_url}
          alt={`عکسی از ${post.author}`}
          loading="lazy"
          decoding="async"
          className="mt-3 w-full rounded-2xl border border-line"
        />
      )}

      <Reactions
        postId={post.id}
        initial={post.reactions}
        canReact={signedIn}
      />
      <Comments
        postId={post.id}
        comments={post.comments}
        canWrite={signedIn}
      />
    </article>
  );
}
