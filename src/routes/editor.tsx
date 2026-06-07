import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import { EditorForm } from "@/components/EditorForm";
import { AuthDialog } from "@/components/AuthDialog";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/editor")({
  component: EditorPage,
});

function EditorPage() {
  const { isAuthenticated } = useAuth();
  const [authOpen, setAuthOpen] = useState(!isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) setAuthOpen(true);
    else setAuthOpen(false);
  }, [isAuthenticated]);

  return (
    <PageTransition>
      <div className="border-b border-border bg-card/30">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">New story</p>
          {!isAuthenticated && <p className="text-xs text-muted-foreground">Sign in to publish</p>}
        </div>
      </div>
      <EditorForm disabled={!isAuthenticated} />
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </PageTransition>
  );
}
