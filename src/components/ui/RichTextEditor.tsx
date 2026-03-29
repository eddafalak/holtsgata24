import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from '@/components/ui/button'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Skrifaðu umræðu hér...',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    immediatelyRender: false,
  })

  return (
    <div className="rounded-lg border border-[#e6e8e9] bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-[#f2f3f4] p-2">
        <Button type="button" variant="outline" size="xs" onClick={() => editor?.chain().focus().toggleBold().run()}>
          Feitletrað
        </Button>
        <Button type="button" variant="outline" size="xs" onClick={() => editor?.chain().focus().toggleItalic().run()}>
          Skáletrað
        </Button>
        <Button type="button" variant="outline" size="xs" onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          Punktalisti
        </Button>
        <Button type="button" variant="outline" size="xs" onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
          Tölulisti
        </Button>
      </div>
      <EditorContent editor={editor} className="min-h-[140px] p-3 text-[14px] leading-5 text-black" />
    </div>
  )
}

