import { MantineProvider } from '@mantine/core'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ContentBlockEditOverlay from '@/components/content-input/content-blocks/overlay/ContentBlockEditOverlay.tsx'
import {
  getBlockContent,
  upsertBlockContent as upsertBlockContentApi,
} from '@/services/content-page-service.ts'
import type { ContentPageBlockMetadata } from '@/types/content-page.ts'

jest.mock('@/services/content-page-service.ts', () => ({
  getBlockContent: jest.fn(),
  upsertBlockContent: jest.fn(),
}))

jest.mock(
  '@/components/content-input/content-blocks/rtf-block/RtfBlockEditor.tsx',
  () => ({
    __esModule: true,
    default: ({
      content,
      onChange,
    }: {
      content?: string
      onChange: (value: string) => void
    }) => (
      <label>
        Conteúdo
        <textarea
          value={content ?? ''}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
      </label>
    ),
  }),
)

const getBlockContentMock = jest.mocked(getBlockContent)
const upsertBlockContentApiMock = jest.mocked(upsertBlockContentApi)

const metadata: ContentPageBlockMetadata = {
  id: 'block-id',
  title: 'Original title',
  collectionName: 'rtf_block',
  page: 'page-id',
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, resolve, reject }
}

function renderOverlay({
  onClose = jest.fn(),
  onUpdate = jest.fn(),
}: {
  onClose?: jest.Mock
  onUpdate?: jest.Mock
} = {}) {
  render(
    <MantineProvider>
      <ContentBlockEditOverlay
        blockMetadata={metadata}
        opened
        onClose={onClose}
        onUpdate={onUpdate}
      />
    </MantineProvider>,
  )

  return { onClose, onUpdate }
}

describe('ContentBlockEditOverlay', () => {
  it('loads the existing block content and prevents closing while loading', async () => {
    const user = userEvent.setup()
    const request = deferred<string>()
    getBlockContentMock.mockReturnValue(request.promise)
    const { onClose } = renderOverlay()

    expect(screen.getByLabelText('Carregando conteúdo...')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '' })).not.toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(onClose).not.toHaveBeenCalled()

    request.resolve('<p>Saved content</p>')

    expect(await screen.findByLabelText('Conteúdo')).toHaveValue(
      '<p>Saved content</p>',
    )
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes from the close button after loading finishes', async () => {
    const user = userEvent.setup()
    getBlockContentMock.mockResolvedValue('<p>Saved content</p>')
    const { onClose } = renderOverlay()

    await user.click(await screen.findByRole('button', { name: '' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('saves the edited title and content, then notifies the parent', async () => {
    const user = userEvent.setup()
    getBlockContentMock.mockResolvedValue('<p>Old content</p>')
    upsertBlockContentApiMock.mockResolvedValue(true)
    const { onUpdate } = renderOverlay()

    const title = await screen.findByLabelText('Título')
    await user.clear(title)
    await user.type(title, '  Updated title  ')

    const content = screen.getByLabelText('Conteúdo')
    fireEvent.change(content, { target: { value: '<p>New content</p>' } })
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(upsertBlockContentApiMock).toHaveBeenCalledWith({
        ...metadata,
        title: 'Updated title',
        content: '<p>New content</p>',
      })
    })
    expect(onUpdate).toHaveBeenCalledTimes(1)
  })

  it('keeps save controls loading until a successful save finishes', async () => {
    const user = userEvent.setup()
    const save = deferred<boolean>()
    getBlockContentMock.mockResolvedValue('<p>Content</p>')
    upsertBlockContentApiMock.mockReturnValue(save.promise)
    const { onUpdate } = renderOverlay()

    const saveButton = await screen.findByRole('button', { name: 'Salvar' })
    await user.click(saveButton)

    expect(saveButton).toBeDisabled()
    expect(screen.queryByRole('button', { name: '' })).not.toBeInTheDocument()
    expect(onUpdate).not.toHaveBeenCalled()

    save.resolve(true)

    await waitFor(() => expect(saveButton).toBeEnabled())
    expect(onUpdate).toHaveBeenCalledTimes(1)
  })

  it('recovers the controls after a failed save', async () => {
    const user = userEvent.setup()
    const error = new Error('Save failed')
    const consoleError = jest.spyOn(console, 'error').mockImplementation()
    getBlockContentMock.mockResolvedValue('<p>Existing content</p>')
    upsertBlockContentApiMock.mockRejectedValue(error)
    const { onUpdate } = renderOverlay()

    const saveButton = await screen.findByRole('button', { name: 'Salvar' })
    await user.click(saveButton)

    await waitFor(() => expect(saveButton).toBeEnabled())
    expect(consoleError).toHaveBeenCalledWith(error)
    expect(screen.getByLabelText('Conteúdo')).toHaveValue(
      '<p>Existing content</p>',
    )
    expect(onUpdate).toHaveBeenCalledTimes(1)

    consoleError.mockRestore()
  })
})
