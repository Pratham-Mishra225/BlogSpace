import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import type { Post } from "@/types";
import { formatDate, truncate } from "@/lib/format";
import { LikeButton } from "@/components/LikeButton";
import { ShareMenu } from "@/components/ShareMenu";
import { DeletePostButton } from "@/components/DeletePostButton";

interface Props {
  post: Post;
  canDelete?: boolean;
  onDeleted?: () => void;
}

const stripHtml = (s: string) =>
  s
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function PostCard({ post, canDelete, onDeleted }: Props) {
  const excerpt = post.format === "html" ? stripHtml(post.content) : post.content;
  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group relative overflow-hidden rounded-lg border border-border bg-card shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]"
    >
      <Link to="/post/$id" params={{ id: post.id }} className="block" aria-label={post.title}>
        <div className="aspect-[16/10] overflow-hidden bg-muted">
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-muted to-muted/60" />
          )}
        </div>
        <div className="flex flex-col gap-3 p-6">
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 2).map((t) => (
              <span
                key={t}
                className="rounded-full bg-muted px-2.5 py-0.5 text-xs uppercase tracking-wider text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
          <h2 className="font-serif text-2xl leading-tight text-foreground">{post.title}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{truncate(excerpt, 140)}</p>
          <div className="flex items-center gap-3 border-t border-border pt-4">
            {post.author.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                {post.author.name?.charAt(0).toUpperCase() ?? "?"}
              </span>
            )}
            <div className="flex-1 text-xs text-muted-foreground">
              <div className="font-medium text-foreground">{post.author.name}</div>
              <div>
                {formatDate(post.createdAt)} · {post.readingTime} min read
              </div>
            </div>
          </div>
        </div>
      </Link>
      <div className="flex items-center justify-between border-t border-border px-3 py-2">
        <LikeButton
          postId={post.id}
          initialLiked={post.isLiked}
          initialCount={post.likeCount}
          size="sm"
        />
        <div className="flex items-center gap-1">
          <ShareMenu postId={post.id} title={post.title} size="sm" />
          {canDelete && <DeletePostButton postId={post.id} onDeleted={onDeleted} />}
        </div>
      </div>
    </motion.article>
  );
}
