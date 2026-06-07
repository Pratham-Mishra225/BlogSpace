import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, FilePen, Pencil } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { PostCard } from "@/components/PostCard";
import { DraftCard } from "@/components/DraftCard";
import { FollowButton } from "@/components/FollowButton";
import { EmptyState } from "@/components/EmptyState";
import { AuthDialog } from "@/components/AuthDialog";
import { useProfile } from "@/hooks/useProfile";
import { useDrafts } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/profile/$id")({
  component: ProfilePage,
});

function ProfilePage() {
  const { id } = Route.useParams();
  const { data, loading, error, refetch } = useProfile(id);
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  // id param is the username; compare against the logged-in user's username.
  const isMe = user?.username === id;
  const drafts = useDrafts();

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

  const handlePostDeleted = () => {
    void refetch();
  };
  const handleDraftDeleted = () => {
    void drafts.refetch();
  };

  const publishedGrid =
    data.posts.length === 0 ? (
      <EmptyState
        icon={FileText}
        title={isMe ? "You haven't published yet" : `${data.user.name} hasn't published yet`}
        description={
          isMe
            ? "Share your first story to see it appear here."
            : "When they share their first story, it will appear here."
        }
      />
    ) : (
      <div className="grid gap-8 sm:grid-cols-2">
        {data.posts.map((p) => (
          <PostCard key={p.id} post={p} canDelete={isMe} onDeleted={handlePostDeleted} />
        ))}
      </div>
    );

  return (
    <PageTransition>
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            {data.user.avatar ? (
              <img
                src={data.user.avatar}
                alt={data.user.name}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-24 w-24 items-center justify-center rounded-full bg-muted text-3xl font-semibold text-muted-foreground">
                {data.user.name?.charAt(0).toUpperCase() ?? "?"}
              </span>
            )}
            <div className="flex-1">
              <h1 className="font-serif text-4xl text-foreground">{data.user.name}</h1>
              <p className="mt-2 max-w-xl text-muted-foreground">{data.user.bio}</p>
              <div className="mt-4 flex gap-6 text-sm">
                <span>
                  <span className="font-semibold text-foreground">{data.followersCount}</span>{" "}
                  <span className="text-muted-foreground">followers</span>
                </span>
                <span>
                  <span className="font-semibold text-foreground">{data.followingCount}</span>{" "}
                  <span className="text-muted-foreground">following</span>
                </span>
                <span>
                  <span className="font-semibold text-foreground">{data.posts.length}</span>{" "}
                  <span className="text-muted-foreground">stories</span>
                </span>
              </div>
            </div>
            {isMe ? (
              <EditProfileButton />
            ) : (
              <FollowButton
                userId={data.user.id}
                initialFollowing={data.isFollowing ?? false}
                onAuthRequired={() => setAuthOpen(true)}
              />
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        {isMe ? (
          <Tabs defaultValue="published" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="drafts">
                Drafts{drafts.data ? ` (${drafts.data.length})` : ""}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="published">{publishedGrid}</TabsContent>
            <TabsContent value="drafts">
              {drafts.loading ? (
                <div className="space-y-3">
                  <div className="h-24 w-full animate-pulse rounded-lg bg-muted" />
                  <div className="h-24 w-full animate-pulse rounded-lg bg-muted" />
                </div>
              ) : !drafts.data || drafts.data.length === 0 ? (
                <EmptyState
                  icon={FilePen}
                  title="No drafts yet"
                  description="Drafts you save while writing will appear here, visible only to you."
                />
              ) : (
                <div className="grid gap-4">
                  {drafts.data.map((p) => (
                    <DraftCard key={p.id} post={p} onDeleted={handleDraftDeleted} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          publishedGrid
        )}
      </section>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </PageTransition>
  );
}

/** Shown on the user's own profile header — navigates to the shared edit-profile screen. */
function EditProfileButton() {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate({ to: "/onboarding" })}
      className="flex shrink-0 items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <Pencil className="h-4 w-4" strokeWidth={1.5} />
      Edit profile
    </button>
  );
}
