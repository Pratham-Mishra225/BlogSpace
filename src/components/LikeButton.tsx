import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { likePost, unlikePost } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
  size?: "sm" | "md";
  onAuthRequired?: () => void;
}

export function LikeButton({
  postId,
  initialLiked,
  initialCount,
  size = "md",
  onAuthRequired,
}: Props) {
  const { isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  const handle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }
    if (pending) return;
    const next = !liked;
    // optimistic
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));
    setPending(true);
    try {
      const res = next ? await likePost(postId) : await unlikePost(postId);
      setLiked(res.isLiked);
      setCount(res.likeCount);
      if (next) toast.success("Added to your likes");
    } catch (err) {
      // rollback
      setLiked(!next);
      setCount((c) => c + (next ? -1 : 1));
      toast.error((err as Error).message);
    } finally {
      setPending(false);
    }
  };

  const iconSize = size === "sm" ? 16 : 18;

  return (
    <button
      type="button"
      onClick={handle}
      aria-pressed={liked}
      aria-label={liked ? "Unlike" : "Like"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full text-sm transition-colors",
        size === "sm" ? "px-2 py-1" : "px-3 py-1.5",
        liked ? "text-rose-500" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={liked ? "on" : "off"}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          className="inline-flex"
        >
          <Heart size={iconSize} strokeWidth={1.75} className={liked ? "fill-rose-500" : ""} />
        </motion.span>
      </AnimatePresence>
      <span className="tabular-nums">{count}</span>
    </button>
  );
}
