import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { PostCard } from "@/components/PostCard";
import { FollowButton } from "@/components/FollowButton";
import { EmptyState } from "@/components/EmptyState";
import { AuthDialog } from "@/components/AuthDialog";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/profile/$id")({
  component: ProfilePage,
});

function ProfilePage() {
  const { id } = Route.useParams();
  const { data, loading, error, refetch } = useProfile(id);
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const isMe = user?.id === id;

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 animate-pulse rounded-full bg-muted" />
          <div className="space-y-3">
            <div className="h-6 w-48 animate-pulse rounded bg-muted" />
            <div className="h-4 w-64 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-serif text-3xl text-foreground">Profile unavailable</h1>
        <p className="mt-3 text-muted-foreground">{error ?? "User not found"}</p>
        <Button onClick={refetch} variant="outline" className="mt-6">
          Try again
        </Button>
      </div>
    );
  }

  return (
    <PageTransition>
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <img
              src={data.user.avatar}
              alt={data.user.name}
              className="h-24 w-24 rounded-full object-cover"
            />
            <div className="flex-1">
              <h1 className="font-serif text-4xl text-foreground">{data.user.name}</h1>
              <p className="mt-2 max-w-xl text-muted-foreground">{data.user.bio}</p>
              <div className="mt-4 flex gap-6 text-sm">
                <span>
                  <span className="font-semibold text-foreground">
                    {data.followersCount}
                  </span>{" "}
                  <span className="text-muted-foreground">followers</span>
                </span>
                <span>
                  <span className="font-semibold text-foreground">
                    {data.followingCount}
                  </span>{" "}
                  <span className="text-muted-foreground">following</span>
                </span>
                <span>
                  <span className="font-semibold text-foreground">
                    {data.posts.length}
                  </span>{" "}
                  <span className="text-muted-foreground">stories</span>
                </span>
              </div>
            </div>
            {!isMe && (
              <FollowButton
                userId={data.user.id}
                onAuthRequired={() => setAuthOpen(true)}
              />
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        {data.posts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={`${data.user.name} hasn't published yet`}
            description="When they share their first story, it will appear here."
          />
        ) : (
          <div className="grid gap-8 sm:grid-cols-2">
            {data.posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </section>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </PageTransition>
  );
}
