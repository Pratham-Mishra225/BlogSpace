import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPost } from "@/services/api";
import type { CreatePostDTO } from "@/types";
import { toast } from "sonner";

interface Props {
  disabled?: boolean;
}

export function EditorForm({ disabled }: Props) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (e: FormEvent, draft: boolean) => {
    e.preventDefault();
    if (disabled) return;
    if (!title.trim() || !content.trim()) {
      toast.error("Add a title and some content first.");
      return;
    }
    setPending(true);
    const dto: CreatePostDTO = {
      title,
      content,
      coverImage: coverImage || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    };
    try {
      const post = await createPost(dto);
      toast.success(draft ? "Saved as draft" : "Published");
      navigate({ to: "/post/$id", params: { id: post.id } });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setPending(false);
    }
  };

  return (
    <form className="mx-auto w-full max-w-3xl space-y-8 px-6 pb-32 pt-12">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        disabled={disabled}
        className="w-full bg-transparent font-serif text-4xl leading-tight text-foreground placeholder:text-muted-foreground/60 focus:outline-none sm:text-5xl"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="Cover image URL (optional)"
          disabled={disabled}
        />
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma separated)"
          disabled={disabled}
        />
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Tell your story… Markdown supported."
        disabled={disabled}
        rows={18}
        className="w-full resize-y bg-transparent font-mono text-base leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
      />

      <div className="glass fixed inset-x-0 bottom-0 z-30 border-t border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-end gap-3 px-6 py-3">
          <Button
            type="button"
            variant="outline"
            onClick={(e) => submit(e, true)}
            disabled={disabled || pending}
          >
            Save draft
          </Button>
          <Button
            type="submit"
            onClick={(e) => submit(e, false)}
            disabled={disabled || pending}
          >
            {pending ? "Publishing…" : "Publish"}
          </Button>
        </div>
      </div>
    </form>
  );
}
