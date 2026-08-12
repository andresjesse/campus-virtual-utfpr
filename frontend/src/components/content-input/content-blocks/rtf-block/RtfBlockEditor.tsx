import {Link, RichTextEditor} from "@mantine/tiptap";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import {useEditor} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {useEffect} from "react";

type RtfBlockEditorProps = {
  content?: string,
  onChange: (value: string) => void,
}

export default function RtfBlockEditor({ content, onChange }: RtfBlockEditorProps) {
  const editor = useEditor({
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({ link: false }),
      Link,
      Subscript,
      Superscript,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    editable: true,
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || editor.getHTML() === content) return;

    editor.commands.setContent(content ?? "", { emitUpdate: false });
  }, [content, editor]);

  return (
    <RichTextEditor editor={editor}>
        <RichTextEditor.Toolbar sticky stickyOffset="var(--docs-header-height)">
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Underline />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.ClearFormatting />
            <RichTextEditor.Highlight />
            <RichTextEditor.Code />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
            <RichTextEditor.H4 />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Blockquote />
            <RichTextEditor.Hr />
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
            <RichTextEditor.Subscript />
            <RichTextEditor.Superscript />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Link />
            <RichTextEditor.Unlink />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.AlignLeft />
            <RichTextEditor.AlignCenter />
            <RichTextEditor.AlignJustify />
            <RichTextEditor.AlignRight />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Undo />
            <RichTextEditor.Redo />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>

        <RichTextEditor.Content />
    </RichTextEditor>
  )
}
