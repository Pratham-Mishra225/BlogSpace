import type { Post } from "@/types";
import { formatDate } from "@/lib/format";
import { DeletePostButton } from "@/components/DeletePostButton";

interface Props {
  post: Post;
  onDeleted?: () => void;
}

export function DraftCard({ post, onDeleted }: Props) {
  return (
    <article className="group relative flex gap-4 overflow-hidden rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      {post.coverImage && (
        <div className="hidden h-24 w-32 shrink-0 overflow-hidden rounded-md bg-muted sm:block">
          <img
            src={post.coverImage}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-xl leading-tight text-foreground">
            {post.title || "Untitled"}
          </h3>
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            Draft
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <p className="text-xs text-muted-foreground">
            Last updated {formatDate(post.updatedAt || post.createdAt)}
          </p>
          <DeletePostButton postId={post.id} onDeleted={onDeleted} />
        </div>
      </div>
    </article>
  );
}
