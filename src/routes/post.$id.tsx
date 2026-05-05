import { createFileRoute, Link } from "@tanstack/react-router";
import { PageTransition } from "@/components/PageTransition";
import { MarkdownRenderer } from "@/lib/markdown";
import { AuthorBio } from "@/components/AuthorBio";
import { usePost } from "@/hooks/usePosts";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AuthDialog } from "@/components/AuthDialog";

export const Route = createFileRoute("/post/$id")({
  component: PostPage,
});

function PostPage() {
  const { id } = Route.useParams();
  const { data, loading, error, refetch } = usePost(id);
  const [authOpen, setAuthOpen] = useState(false);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="space-y-6">
          <div className="h-3 w-32 animate-pulse rounded bg-muted" />
          <div className="h-12 w-3/4 animate-pulse rounded bg-muted" />
          <div className="aspect-[16/9] animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          <div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-serif text-3xl text-foreground">Story unavailable</h1>
        <p className="mt-3 text-muted-foreground">{error ?? "Post not found"}</p>
        <Button onClick={refetch} variant="outline" className="mt-6">
          Try again
        </Button>
      </div>
    );
  }

  return (
    <PageTransition>
      <article className="mx-auto max-w-[720px] px-6 py-16">
        <div className="mb-6 flex flex-wrap gap-2">
          {data.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-muted px-2.5 py-0.5 text-xs uppercase tracking-wider text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>

        <h1 className="font-serif text-4xl leading-tight text-foreground sm:text-5xl">
          {data.title}
        </h1>

        <div className="mt-6 flex items-center gap-3 border-b border-border pb-6">
          <Link to="/profile/$id" params={{ id: data.author.id }}>
            <img
              src={data.author.avatar}
              alt={data.author.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          </Link>
          <div className="text-sm">
            <Link
              to="/profile/$id"
              params={{ id: data.author.id }}
              className="font-medium text-foreground hover:underline"
            >
              {data.author.name}
            </Link>
            <div className="text-muted-foreground">
              {formatDate(data.createdAt)} · {data.readingTime} min read
            </div>
          </div>
        </div>

        {data.coverImage && (
          <img
            src={data.coverImage}
            alt=""
            className="mt-10 aspect-[16/9] w-full rounded-lg object-cover"
          />
        )}

        <div className="mt-12">
          <MarkdownRenderer source={data.content} />
        </div>

        <AuthorBio author={data.author} onAuthRequired={() => setAuthOpen(true)} />
      </article>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </PageTransition>
  );
}
