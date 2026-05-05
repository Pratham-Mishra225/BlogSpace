import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { BookOpen, Search as SearchIcon, UserPlus } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { FeedToggle } from "@/components/FeedToggle";
import { PostCard } from "@/components/PostCard";
import { PostSkeletonGrid } from "@/components/PostSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { usePosts } from "@/hooks/usePosts";
import { useFeedStore } from "@/store/useFeedStore";
import { useSearchStore } from "@/store/useSearchStore";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const mode = useFeedStore((s) => s.mode);
  const setMode = useFeedStore((s) => s.setMode);
  const query = useSearchStore((s) => s.query);
  const clearSearch = useSearchStore((s) => s.clear);
  const { data, loading, error, refetch } = usePosts(mode);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.author.name.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [data, query]);

  return (
    <PageTransition>
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            BlogSpace
          </p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-foreground sm:text-6xl">
            Stories worth your time, written slowly.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            A quiet corner of the internet for essays, field notes, and
            long-form thinking.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <FeedToggle />
          {query && (
            <p className="text-sm text-muted-foreground">
              Showing results for <span className="text-foreground">"{query}"</span>
            </p>
          )}
        </div>

        {loading && <PostSkeletonGrid />}

        {error && !loading && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
            <p className="text-foreground">{error}</p>
            <Button variant="outline" onClick={refetch} className="mt-4">
              Try again
            </Button>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && query && (
          <EmptyState
            icon={SearchIcon}
            title="No results found"
            description={`Nothing matches "${query}". Try a different keyword, tag, or writer.`}
            action={{ label: "Clear search", onClick: clearSearch }}
          />
        )}

        {!loading && !error && filtered.length === 0 && !query && mode === "explore" && (
          <EmptyState
            icon={BookOpen}
            title="No stories yet"
            description="The page is blank. Be the first to fill it."
            action={{ label: "Write your first post", onClick: () => navigate({ to: "/editor" }) }}
          />
        )}

        {!loading && !error && filtered.length === 0 && !query && mode === "following" && (
          <EmptyState
            icon={UserPlus}
            title="Your feed is quiet"
            description="Follow writers you admire and their newest stories will land here."
            action={{ label: "Discover writers", onClick: () => setMode("explore") }}
          />
        )}
      </section>

    </PageTransition>
  );
}
