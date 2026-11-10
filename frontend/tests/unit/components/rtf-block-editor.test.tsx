import type { PropsWithChildren } from 'react'
import { render } from '@testing-library/react'

import RtfBlockEditor from '@/components/content-input/content-blocks/overlay/rtf-block/RtfBlockEditor.tsx'
import { useEditor } from '@tiptap/react'

jest.mock('@mantine/tiptap', () => {
  const Component = ({ children }: PropsWithChildren) => <div>{children}</div>
  const controls = [
    'Toolbar',
    'ControlsGroup',
    'Bold',
    'Italic',
    'Underline',
    'Strikethrough',
    'ClearFormatting',
    'Highlight',
    'Code',
    'H1',
    'H2',
    'H3',
    'H4',
    'Blockquote',
    'Hr',
    'BulletList',
    'OrderedList',
    'Subscript',
    'Superscript',
    'Link',
    'Unlink',
    'AlignLeft',
    'AlignCenter',
    'AlignJustify',
    'AlignRight',
    'Undo',
    'Redo',
    'Content',
  ]
  const RichTextEditor = Object.assign(
    Component,
    Object.fromEntries(controls.map((control) => [control, Component])),
  )

  return { RichTextEditor }
})

jest.mock('@tiptap/react', () => ({
  useEditor: jest.fn(),
}))

jest.mock('@tiptap/starter-kit', () => ({
  __esModule: true,
  default: { configure: jest.fn(() => ({})) },
}))

const useEditorMock = jest.mocked(useEditor)
const setContent = jest.fn()
const getHTML = jest.fn()
const editor = {
  commands: { setContent },
  getHTML,
}

type EditorOptions = {
  onUpdate: (event: { editor: { getHTML: () => string } }) => void
}

function latestEditorOptions() {
  const calls = useEditorMock.mock.calls
  return calls[calls.length - 1][0] as EditorOptions
}

describe('RtfBlockEditor', () => {
  beforeEach(() => {
    getHTML.mockReturnValue('')
    useEditorMock.mockReturnValue(editor as never)
  })

  it('synchronizes content that arrives asynchronously', () => {
    const { rerender } = render(
      <RtfBlockEditor content="" onChange={jest.fn()} />,
    )
    setContent.mockClear()
    getHTML.mockReturnValue('<p>Previous content</p>')

    rerender(
      <RtfBlockEditor
        content="<p>Loaded content</p>"
        onChange={jest.fn()}
      />,
    )

    expect(setContent).toHaveBeenCalledWith('<p>Loaded content</p>', {
      emitUpdate: false,
    })
  })

  it('does not set content when the editor contains the same value as the prop', () => {
    getHTML.mockReturnValue('<p>Current content</p>')

    render(
      <RtfBlockEditor
        content="<p>Current content</p>"
        onChange={jest.fn()}
      />,
    )

    expect(setContent).not.toHaveBeenCalled()
  })

  it('uses an empty string and suppresses updates when content is cleared', () => {
    getHTML.mockReturnValue('<p>Existing content</p>')

    render(<RtfBlockEditor content={undefined} onChange={jest.fn()} />)

    expect(setContent).toHaveBeenCalledWith('', { emitUpdate: false })
  })

  it('forwards genuine editor changes as HTML', () => {
    const onChange = jest.fn()
    render(<RtfBlockEditor content="" onChange={onChange} />)

    latestEditorOptions().onUpdate({
      editor: { getHTML: () => '<p>User-edited content</p>' },
    })

    expect(onChange).toHaveBeenCalledWith('<p>User-edited content</p>')
  })
})
