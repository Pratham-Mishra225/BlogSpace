import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import { checkUsernameAvailability } from "@/services/api";
import { toast } from "sonner";
import { Check, X, Loader2, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

function OnboardingPage() {
  const { user, isAuthenticated, isProfileComplete, saveProfile } = useAuth();
  const navigate = useNavigate();

  // Detect whether the user is editing an existing profile or setting up for the first time.
  const isEditMode = isProfileComplete;

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [pending, setPending] = useState(false);

  const [available, setAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const debouncedUsername = useDebounce(username, 400);

  /**
   * Track the username the user had when they opened the page.
   * The availability checker must skip the network call when the value
   * hasn't changed — otherwise the user can never re-save their own username.
   */
  const originalUsernameRef = useRef<string>("");

  // Redirect unauthenticated visitors; pre-fill existing values.
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/" });
    } else if (user) {
      setFullName(user.name ?? "");
      setUsername(user.username ?? "");
      setBio(user.bio ?? "");
      setAvatar(user.avatar ?? "");
      originalUsernameRef.current = user.username ?? "";
    }
  }, [isAuthenticated, user, navigate]);

  // Username availability check — skipped when the value is unchanged.
  useEffect(() => {
    const u = debouncedUsername.trim();

    // Reset indicator when too short.
    if (u.length < 3) {
      setAvailable(null);
      return;
    }

    // Skip the network check if the user hasn't changed their username.
    if (u === originalUsernameRef.current) {
      setAvailable(null); // neutral state — no indicator needed
      return;
    }

    setChecking(true);
    checkUsernameAvailability(u)
      .then((r) => setAvailable(r.available))
      .catch(() => setAvailable(null))
      .finally(() => setChecking(false));
  }, [debouncedUsername]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || username.trim().length < 3) {
      toast.error("Add your name and a valid username.");
      return;
    }

    // Only block if the username has changed AND it's taken.
    const usernameChanged = username.trim() !== originalUsernameRef.current;
    if (usernameChanged && available === false) {
      toast.error("That username is taken.");
      return;
    }

    setPending(true);
    try {
      await saveProfile({
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
        bio: bio.trim(),
        avatar: avatar.trim(),
      });
      toast.success(isEditMode ? "Profile updated" : "Profile created — welcome!");
      navigate({ to: "/" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setPending(false);
    }
  };

  const previewAvatar =
    avatar.trim() ||
    `https://i.pravatar.cc/200?u=${encodeURIComponent(username || fullName || "writer")}`;

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl px-6 py-16">
        {/* Back button — only in edit mode */}
        {isEditMode && (
          <button
            type="button"
            onClick={() => navigate({ to: "/profile/$id", params: { id: user?.username ?? "" } })}
            className="mb-8 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to profile
          </button>
        )}

        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {isEditMode ? "Your account" : "Welcome"}
        </p>
        <h1 className="mt-3 font-serif text-4xl text-foreground">
          {isEditMode ? "Edit your profile" : "Set up your profile"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {isEditMode
            ? "Update your details below — changes are saved immediately."
            : "A few quick details so readers know who's writing."}
        </p>

        <form onSubmit={submit} className="mt-10 space-y-8">
          {/* Avatar preview + URL input */}
          <div className="flex items-center gap-6">
            <img
              src={previewAvatar}
              alt="Avatar preview"
              className="h-24 w-24 rounded-full border border-border object-cover"
            />
            <div className="flex-1 space-y-2">
              <Label htmlFor="avatar">Profile picture URL</Label>
              <Input
                id="avatar"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://…"
              />
              <p className="text-xs text-muted-foreground">
                Paste any public image URL. Leave blank to use an auto-generated avatar.
              </p>
            </div>
          </div>

          {/* Full name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              maxLength={60}
              required
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <Input
                id="username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20))
                }
                placeholder="yourhandle"
                minLength={3}
                maxLength={20}
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {checking && <Loader2 className="h-4 w-4 animate-spin" />}
                {!checking && available === true && (
                  <Check className="h-4 w-4 text-emerald-500" />
                )}
                {!checking && available === false && (
                  <X className="h-4 w-4 text-destructive" />
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              3–20 characters · letters, numbers, underscore
            </p>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 160))}
              placeholder="A sentence or two about what you write."
              rows={3}
            />
            <p className="text-right text-xs text-muted-foreground">
              {bio.length}/160
            </p>
          </div>

          <div className="flex justify-end gap-3">
            {/* "Skip" only shown during first-time setup */}
            {!isEditMode && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate({ to: "/" })}
              >
                Skip for now
              </Button>
            )}
            {isEditMode && (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  navigate({ to: "/profile/$id", params: { id: user?.username ?? "" } })
                }
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : isEditMode ? "Save changes" : "Save profile"}
            </Button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}
