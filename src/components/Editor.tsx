"use client";

import { useEditor, EditorContent, type Editor as TiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * TipTap rich-text editor.
 * Supports headings, bold, italic, underline, strike, lists, blockquote,
 * code block, links and INLINE image upload (to Supabase Storage).
 * Emits sanitized-on-save HTML through `onChange`.
 */
export default function Editor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    // Avoid SSR hydration mismatch (TipTap renders on the client).
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({
        placeholder: "Write your story… Use the toolbar to format.",
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: { class: "tiptap" },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const uploadImage = useCallback(
    async (file: File) => {
      if (!editor) return;
      try {
        const supabase = createClient();
        const ext = file.name.split(".").pop() || "png";
        const path = `content/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from("article-images")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (error) throw error;
        const {
          data: { publicUrl },
        } = supabase.storage.from("article-images").getPublicUrl(path);
        editor.chain().focus().setImage({ src: publicUrl }).run();
      } catch (err) {
        alert(
          "Image upload failed: " +
            (err instanceof Error ? err.message : "unknown error")
        );
      }
    },
    [editor]
  );

  const onPickImage = () => fileInputRef.current?.click();

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL", previous ?? "https://");
    if (url === null) return; // cancelled
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }, [editor]);

  if (!editor) {
    return (
      <div className="flex min-h-[380px] items-center justify-center rounded-xl border border-brand-border bg-white text-sm text-gray-400">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-brand-border bg-white focus-within:border-brand-red focus-within:ring-2 focus-within:ring-brand-red/20">
      <Toolbar
        editor={editor}
        onPickImage={onPickImage}
        onSetLink={setLink}
      />
      <EditorContent editor={editor} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadImage(file);
          e.target.value = ""; // allow re-selecting the same file
        }}
      />
    </div>
  );
}

/* ── Toolbar ─────────────────────────────────────────────── */

function Toolbar({
  editor,
  onPickImage,
  onSetLink,
}: {
  editor: TiptapEditor;
  onPickImage: () => void;
  onSetLink: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-brand-border bg-gray-50/70 px-2 py-2">
      <Btn
        active={editor.isActive("heading", { level: 1 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
        label="H1"
      />
      <Btn
        active={editor.isActive("heading", { level: 2 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        label="H2"
      />
      <Btn
        active={editor.isActive("heading", { level: 3 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        label="H3"
      />
      <Divider />
      <Btn
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        label="B"
        className="font-extrabold"
      />
      <Btn
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        label="I"
        className="italic"
      />
      <Btn
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        label="U"
        className="underline"
      />
      <Btn
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        label="S"
        className="line-through"
      />
      <Divider />
      <Btn
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        label="• List"
      />
      <Btn
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        label="1. List"
      />
      <Btn
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        label="❝ Quote"
      />
      <Btn
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        label="{ } Code"
      />
      <Divider />
      <Btn
        active={editor.isActive("link")}
        onClick={onSetLink}
        label="🔗 Link"
      />
      <Btn active={false} onClick={onPickImage} label="🖼 Image" />
      <Divider />
      <Btn
        active={false}
        onClick={() => editor.chain().focus().undo().run()}
        label="↶"
      />
      <Btn
        active={false}
        onClick={() => editor.chain().focus().redo().run()}
        label="↷"
      />
    </div>
  );
}

function Btn({
  active,
  onClick,
  label,
  className = "",
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-colors ${
        active
          ? "bg-brand-red text-white"
          : "text-brand-dark hover:bg-white hover:text-brand-red"
      } ${className}`}
    >
      {label}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-brand-border" aria-hidden="true" />;
}
