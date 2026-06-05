import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code2,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, disabled, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        // Link and Underline are bundled in StarterKit v3; configure them here.
        link: { openOnClick: false, autolink: true },
      }),
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: placeholder ?? "Tell your story…",
      }),
    ],
    content: value || "",
    editable: !disabled,
    editorProps: {
      attributes: {
        class:
          "prose-editorial focus:outline-none min-h-[60vh] max-w-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  return (
    <div className="space-y-4">
      <Toolbar editor={editor} disabled={disabled} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor, disabled }: { editor: Editor; disabled?: boolean }) {
  const Btn = ({
    onClick,
    active,
    label,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    label: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40",
        active && "bg-accent text-foreground",
      )}
    >
      {children}
    </button>
  );

  const insertImage = () => {
    const url = window.prompt("Image URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="glass sticky top-16 z-20 -mx-2 flex flex-wrap items-center gap-1 rounded-lg border border-border px-2 py-1.5">
      <Btn label="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
        <Bold className="h-4 w-4" strokeWidth={1.75} />
      </Btn>
      <Btn label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
        <Italic className="h-4 w-4" strokeWidth={1.75} />
      </Btn>
      <Btn label="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}>
        <UnderlineIcon className="h-4 w-4" strokeWidth={1.75} />
      </Btn>
      <Divider />
      <Btn label="H1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })}>
        <Heading1 className="h-4 w-4" strokeWidth={1.75} />
      </Btn>
      <Btn label="H2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>
        <Heading2 className="h-4 w-4" strokeWidth={1.75} />
      </Btn>
      <Btn label="H3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}>
        <Heading3 className="h-4 w-4" strokeWidth={1.75} />
      </Btn>
      <Divider />
      <Btn label="Bulleted list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
        <List className="h-4 w-4" strokeWidth={1.75} />
      </Btn>
      <Btn label="Ordered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
        <ListOrdered className="h-4 w-4" strokeWidth={1.75} />
      </Btn>
      <Btn label="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
        <Quote className="h-4 w-4" strokeWidth={1.75} />
      </Btn>
      <Btn label="Code block" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")}>
        <Code2 className="h-4 w-4" strokeWidth={1.75} />
      </Btn>
      <Divider />
      <Btn label="Align left" onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })}>
        <AlignLeft className="h-4 w-4" strokeWidth={1.75} />
      </Btn>
      <Btn label="Align center" onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })}>
        <AlignCenter className="h-4 w-4" strokeWidth={1.75} />
      </Btn>
      <Btn label="Align right" onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })}>
        <AlignRight className="h-4 w-4" strokeWidth={1.75} />
      </Btn>
      <Divider />
      <Btn label="Insert image" onClick={insertImage}>
        <ImageIcon className="h-4 w-4" strokeWidth={1.75} />
      </Btn>
      <Btn label="Insert link" onClick={setLink} active={editor.isActive("link")}>
        <LinkIcon className="h-4 w-4" strokeWidth={1.75} />
      </Btn>
      <Btn label="Horizontal divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className="h-4 w-4" strokeWidth={1.75} />
      </Btn>
    </div>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-border" aria-hidden />;
}
