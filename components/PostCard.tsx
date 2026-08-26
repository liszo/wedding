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
    <article className="rounded-3xl bg-raised/60 p-5 ring-1 ring-mist/8">
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <span className="text-sm text-candle/80">{post.author}</span>
        <div className="flex items-center gap-3">
          <time className="text-xs text-mist/35">{agoFa(post.created_at)}</time>
          {admin && <DeletePost id={post.id} />}
        </div>
      </header>

      {post.body && (
        <p className="whitespace-pre-wrap text-sm leading-7 text-mist/85">
          {post.body}
        </p>
      )}

      {post.image_url && (
        <img
          src={post.image_url}
          alt=""
          loading="lazy"
          className="mt-3 w-full rounded-2xl ring-1 ring-mist/10"
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