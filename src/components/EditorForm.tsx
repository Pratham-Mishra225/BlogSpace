import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/RichTextEditor";
import { createPost, saveDraft } from "@/services/api";
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

  const submit = async (e: FormEvent | React.MouseEvent, draft: boolean) => {
    e.preventDefault();
    if (disabled) return;
    const isEmpty = !content.replace(/<[^>]+>/g, "").trim();
    if (!title.trim() || isEmpty) {
      toast.error("Add a title and some content first.");
      return;
    }
    setPending(true);
    const dto: CreatePostDTO = {
      title,
      content,
      format: "html",
      coverImage: coverImage || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    };
    try {
      const post = draft ? await saveDraft(dto) : await createPost(dto);
      if (draft) {
        toast.success("Draft saved");
        navigate({ to: "/profile/$id", params: { id: post.author.username ?? post.author.id } });
      } else {
        toast.success("Published");
        navigate({ to: "/post/$id", params: { id: post.id } });
      }
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
        maxLength={140}
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

      <RichTextEditor value={content} onChange={setContent} disabled={disabled} />

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
          <Button type="submit" onClick={(e) => submit(e, false)} disabled={disabled || pending}>
            {pending ? "Publishing…" : "Publish"}
          </Button>
        </div>
      </div>
    </form>
  );
}
