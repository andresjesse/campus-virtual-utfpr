import { MantineProvider } from '@mantine/core'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ContentBlockEditOverlay from '@/components/content-input/content-blocks/overlay/ContentBlockEditOverlay.tsx'
import { notifications } from '@mantine/notifications'
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
  '@/components/content-input/content-blocks/overlay/rtf-block/RtfBlockEditor.tsx',
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

const newBlockMetadata: ContentPageBlockMetadata = {
  title: '',
  collectionName: 'rtf_block',
  page: 'page-id',
}

function renderOverlay({
  onClose = jest.fn(),
  onUpdate = jest.fn(),
  blockMetadata: metadataOverride = metadata,
}: {
  onClose?: jest.Mock
  onUpdate?: jest.Mock
  blockMetadata?: ContentPageBlockMetadata
} = {}) {
  render(
    <MantineProvider>
      <ContentBlockEditOverlay
        blockMetadata={metadataOverride}
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

    const saveButton = screen.getByRole('button', { name: 'Salvar' })
    expect(saveButton).toBeInTheDocument()
    expect(saveButton).toBeEnabled()

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

  it('recovers the controls and keeps the overlay open after a failed save', async () => {
    const user = userEvent.setup()
    const notificationsShowMock = jest
      .spyOn(notifications, 'show')
      .mockImplementation()
    getBlockContentMock.mockResolvedValue('<p>Existing content</p>')
    upsertBlockContentApiMock.mockRejectedValue(new Error('Save failed'))
    const { onUpdate } = renderOverlay()

    const saveButton = await screen.findByRole('button', { name: 'Salvar' })
    await user.click(saveButton)

    await waitFor(() => expect(saveButton).toBeEnabled())
    expect(notificationsShowMock).toHaveBeenCalledWith({
      color: 'red',
      title: 'Falha ao atualizar o conteúdo',
      message:
        'Não foi possível atualizar o conteúdo. Os dados permanecem os mesmos.',
    })
    expect(screen.getByLabelText('Conteúdo')).toHaveValue(
      '<p>Existing content</p>',
    )
    expect(onUpdate).not.toHaveBeenCalled()

    notificationsShowMock.mockRestore()
  })

  it('blocks saving a new block without content and shows a friendly notification', async () => {
    const user = userEvent.setup()
    const notificationsShowMock = jest
      .spyOn(notifications, 'show')
      .mockImplementation()
    const { onUpdate } = renderOverlay({ blockMetadata: newBlockMetadata })

    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(notificationsShowMock).toHaveBeenCalledWith({
        color: 'yellow',
        title: 'Bloco sem conteúdo',
        message: 'É preciso adicionar conteúdo para criar um bloco.',
      })
    })
    expect(upsertBlockContentApiMock).not.toHaveBeenCalled()
    expect(onUpdate).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Conteúdo')).toBeInTheDocument()

    notificationsShowMock.mockRestore()
  })

  it('blocks saving an existing block emptied of content', async () => {
    const user = userEvent.setup()
    const notificationsShowMock = jest
      .spyOn(notifications, 'show')
      .mockImplementation()
    getBlockContentMock.mockResolvedValue('')
    const { onUpdate } = renderOverlay()

    await user.click(await screen.findByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(notificationsShowMock).toHaveBeenCalledWith({
        color: 'yellow',
        title: 'Bloco sem conteúdo',
        message: 'O bloco de texto não pode ficar vazio.',
      })
    })
    expect(upsertBlockContentApiMock).not.toHaveBeenCalled()
    expect(onUpdate).not.toHaveBeenCalled()

    notificationsShowMock.mockRestore()
  })
})
