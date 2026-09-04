import { fireEvent, render, screen } from '@testing-library/react'

import { MantineProvider } from '@mantine/core'

import FileBlockEditor from '@/components/content-input/content-blocks/overlay/file-block/FileBlockEditor.tsx'
import type { FileBlockContentValue } from '@/types/content-page.ts'

const mockExistingUrl = 'http://localhost/api/files/c/r/existing.png'
const mockFile = new File(['x'], 'a.png', { type: 'image/png' })

jest.mock(
  '@/components/content-input/content-blocks/overlay/file-block/DropzoneSection.tsx',
  () => ({
    __esModule: true,
    default: ({ onDrop }: { onDrop: (files: File[]) => void }) => (
      <button type="button" onClick={() => onDrop([mockFile])}>
        Drop
      </button>
    ),
  }),
)

jest.mock(
  '@/components/content-input/content-blocks/overlay/file-block/FilesPreviewSection.tsx',
  () => ({
    __esModule: true,
    default: ({
      content,
      onToggleDelete,
    }: {
      content?: (string | undefined)[]
      onToggleDelete?: (url: string) => void
    }) => (
      <div>
        {(content ?? [])
          .filter((url): url is string => !!url)
          .map((url) => (
            <button key={url} type="button" onClick={() => onToggleDelete?.(url)}>
              Toggle {url}
            </button>
          ))}
      </div>
    ),
  }),
)

function renderEditor() {
  const onChange = jest.fn()
  render(
    <MantineProvider>
      <FileBlockEditor
        content={{ newFiles: [], deletedUrls: [], urls: [mockExistingUrl] }}
        onChange={onChange}
      />
    </MantineProvider>,
  )
  return { onChange }
}

function lastContent(onChange: jest.Mock): FileBlockContentValue {
  return onChange.mock.calls[onChange.mock.calls.length - 1][0]
}

describe('FileBlockEditor', () => {
  beforeEach(() => {
    URL.createObjectURL = jest.fn(() => `blob:${Math.random()}`)
    URL.revokeObjectURL = jest.fn()
  })

  it('starts with no uploads or deletions', () => {
    const { onChange } = renderEditor()

    expect(lastContent(onChange)).toEqual({
      newFiles: [],
      deletedUrls: [],
      urls: [mockExistingUrl],
    })
  })

  it('adds dropped files to the pending uploads', () => {
    const { onChange } = renderEditor()

    fireEvent.click(screen.getByRole('button', { name: 'Drop' }))

    expect(lastContent(onChange).newFiles).toEqual([mockFile])
    expect(lastContent(onChange).deletedUrls).toEqual([])
  })

  it('marks an existing image for deletion and restores it on a second click', () => {
    const { onChange } = renderEditor()

    fireEvent.click(
      screen.getByRole('button', { name: `Toggle ${mockExistingUrl}` }),
    )
    expect(lastContent(onChange).deletedUrls).toEqual([mockExistingUrl])

    fireEvent.click(
      screen.getByRole('button', { name: `Toggle ${mockExistingUrl}` }),
    )
    expect(lastContent(onChange).deletedUrls).toEqual([])
  })

  it('excludes a dropped file from the upload when marked for deletion', () => {
    const { onChange } = renderEditor()

    fireEvent.click(screen.getByRole('button', { name: 'Drop' }))

    const pendingToggle = screen
      .getAllByRole('button')
      .find((button) => button.textContent?.includes('blob:'))
    expect(pendingToggle).toBeTruthy()
    fireEvent.click(pendingToggle!)

    expect(lastContent(onChange).newFiles).toEqual([])
    expect(lastContent(onChange).deletedUrls).toEqual([])
  })
})