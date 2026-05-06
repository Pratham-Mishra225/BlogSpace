import { Share2, Link as LinkIcon, MessageCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  postId: string;
  title: string;
  size?: "sm" | "md";
}

export function ShareMenu({ postId, title, size = "md" }: Props) {
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/post/${postId}`
      : `/post/${postId}`;

  const copyLink = async (e: Event) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  const shareWhatsApp = (e: Event) => {
    e.preventDefault();
    const text = encodeURIComponent(`${title} — ${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          aria-label="Share"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full text-sm text-muted-foreground transition-colors hover:text-foreground",
            size === "sm" ? "px-2 py-1" : "px-3 py-1.5",
          )}
        >
          <Share2 size={size === "sm" ? 16 : 18} strokeWidth={1.75} />
          <span className="hidden sm:inline">Share</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onSelect={copyLink} className="gap-2">
          <LinkIcon className="h-4 w-4" strokeWidth={1.5} />
          Copy link
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={shareWhatsApp} className="gap-2">
          <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
          WhatsApp
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
