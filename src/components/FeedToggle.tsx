import { useFeedStore, type FeedMode } from "@/store/useFeedStore";
import { cn } from "@/lib/utils";

const tabs: { id: FeedMode; label: string }[] = [
  { id: "explore", label: "Explore" },
  { id: "following", label: "Following" },
];

export function FeedToggle() {
  const mode = useFeedStore((s) => s.mode);
  const setMode = useFeedStore((s) => s.setMode);

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setMode(t.id)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            mode === t.id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
