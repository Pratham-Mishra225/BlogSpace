import { Link } from "@tanstack/react-router";
import type { User } from "@/types";
import { FollowButton } from "@/components/FollowButton";

interface Props {
  author: User;
  onAuthRequired?: () => void;
}

export function AuthorBio({ author, onAuthRequired }: Props) {
  return (
    <aside className="mt-16 flex flex-col gap-4 rounded-lg border border-border bg-card p-6 sm:flex-row sm:items-center">
      <Link to="/profile/$id" params={{ id: author.username }}>
        {author.avatar ? (
          <img
            src={author.avatar}
            alt={author.name}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-xl font-semibold text-muted-foreground">
            {author.name?.charAt(0).toUpperCase() ?? "?"}
          </span>
        )}
      </Link>
      <div className="flex-1">
        <Link
          to="/profile/$id"
          params={{ id: author.username }}
          className="font-serif text-xl text-foreground hover:underline"
        >
          {author.name}
        </Link>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {author.bio}
        </p>
      </div>
      <FollowButton userId={author.id} onAuthRequired={onAuthRequired} />
    </aside>
  );
}
