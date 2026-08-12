import { MantineProvider } from '@mantine/core'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { notifications } from '@mantine/notifications'

import BlocksList from '@/components/content-page-form/BlocksList.tsx'
import { DialogContext } from '@/contexts/dialog-context.ts'
import { getAllContentBlocksMetadata } from '@/helpers/content-pages-service-helper.ts'
import { deleteBlockContent } from '@/services/content-page-service.ts'
import type { ContentPageBlockMetadata } from '@/types/content-page.ts'
import type { DialogContextValue } from '@/types/user-feedback.ts'

jest.mock('@/helpers/content-pages-service-helper.ts', () => ({
  getAllContentBlocksMetadata: jest.fn(),
}))

jest.mock('@/services/content-page-service.ts', () => ({
  deleteBlockContent: jest.fn(),
}))

jest.mock('@mantine/notifications', () => ({
  notifications: { show: jest.fn() },
}))

jest.mock('@/containers/DroppableContainer.tsx', () => ({
  __esModule: true,
  default: ({
    children,
    handleDrop,
  }: {
    children: React.ReactNode
    handleDrop: (blockType: string) => void
  }) => (
    <div>
      <button type="button" onClick={() => handleDrop('rtf_block')}>
        Drop rich text block
      </button>
      {children}
    </div>
  ),
}))

jest.mock('@/components/content-input/content-blocks/BlockDisplay.tsx', () => ({
  __esModule: true,
  default: ({
    metadata,
    onDelete,
    onEdit,
  }: {
    metadata: ContentPageBlockMetadata
    onDelete: () => Promise<void>
    onEdit: (id: string, collectionName: 'rtf_block') => void
  }) => (
    <article>
      <span>{metadata.title}</span>
      <button
        type="button"
        onClick={() => onEdit(metadata.id!, 'rtf_block')}
      >
        Edit {metadata.title}
      </button>
      <button
        type="button"
        onClick={() => void onDelete().catch(() => undefined)}
      >
        Delete {metadata.title}
      </button>
    </article>
  ),
}))

jest.mock(
  '@/components/content-input/content-blocks/overlay/ContentBlockEditOverlay.tsx',
  () => ({
    __esModule: true,
    default: ({
      blockMetadata,
      opened,
      onClose,
      onUpdate,
    }: {
      blockMetadata: ContentPageBlockMetadata
      opened: boolean
      onClose: () => void
      onUpdate: () => void
    }) =>
      opened ? (
        <div role="dialog">
          <span data-testid="editor-metadata">
            {JSON.stringify(blockMetadata)}
          </span>
          <button type="button" onClick={onUpdate}>
            Save editor
          </button>
          <button type="button" onClick={onClose}>
            Close editor
          </button>
        </div>
      ) : null,
  }),
)

const getAllContentBlocksMetadataMock = jest.mocked(
  getAllContentBlocksMetadata,
)
const deleteBlockContentMock = jest.mocked(deleteBlockContent)
const showNotificationMock = jest.mocked(notifications.show)

const existingBlock: ContentPageBlockMetadata = {
  id: 'block-1',
  title: 'Introduction',
  collectionName: 'rtf_block',
}

function renderBlocksList(
  confirm: DialogContextValue['confirm'] = jest.fn().mockResolvedValue(true),
) {
  render(
    <MantineProvider>
      <DialogContext.Provider value={{ confirm }}>
        <MemoryRouter initialEntries={['/pages/page-1']}>
          <Routes>
            <Route path="/pages/:pageId" element={<BlocksList />} />
          </Routes>
        </MemoryRouter>
      </DialogContext.Provider>
    </MantineProvider>,
  )

  return { confirm }
}

describe('BlocksList', () => {
  it('opens the editor with the selected block metadata', async () => {
    const user = userEvent.setup()
    getAllContentBlocksMetadataMock.mockResolvedValue({
      rtf_block: [existingBlock],
    })
    renderBlocksList()

    await user.click(
      await screen.findByRole('button', { name: 'Edit Introduction' }),
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByTestId('editor-metadata')).toHaveTextContent(
      JSON.stringify({ ...existingBlock, page: 'page-1' }),
    )
  })

  it('creates draft metadata after a block is dropped', async () => {
    const user = userEvent.setup()
    getAllContentBlocksMetadataMock.mockResolvedValue({ rtf_block: [] })
    renderBlocksList()
    await screen.findByRole('button', { name: 'Drop rich text block' })

    await user.click(screen.getByRole('button', { name: 'Drop rich text block' }))

    expect(screen.getByTestId('editor-metadata')).toHaveTextContent(
      JSON.stringify({
        title: 'Título provisório',
        collectionName: 'rtf_block',
        page: 'page-1',
      }),
    )
  })

  it('closes the editor and refreshes blocks after a save', async () => {
    const user = userEvent.setup()
    getAllContentBlocksMetadataMock
      .mockResolvedValueOnce({ rtf_block: [existingBlock] })
      .mockResolvedValueOnce({
        rtf_block: [{ ...existingBlock, title: 'Updated introduction' }],
      })
    renderBlocksList()

    await user.click(
      await screen.findByRole('button', { name: 'Edit Introduction' }),
    )
    await user.click(screen.getByRole('button', { name: 'Save editor' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(await screen.findByText('Updated introduction')).toBeInTheDocument()
    expect(getAllContentBlocksMetadataMock).toHaveBeenCalledTimes(2)
    expect(getAllContentBlocksMetadataMock).toHaveBeenLastCalledWith(
      'page-1',
      false,
    )
  })

  it('requires confirmation and leaves the block when deletion is cancelled', async () => {
    const user = userEvent.setup()
    const confirm = jest.fn().mockResolvedValue(false)
    getAllContentBlocksMetadataMock.mockResolvedValue({
      rtf_block: [existingBlock],
    })
    renderBlocksList(confirm)

    await user.click(
      await screen.findByRole('button', { name: 'Delete Introduction' }),
    )

    expect(confirm).toHaveBeenCalledWith({
      title: 'Excluir Bloco',
      firstMessage: 'Deseja mesmo excluir o bloco Introduction?',
      secondMessage: 'Esta ação não pode ser desfeita.',
    })
    expect(deleteBlockContentMock).not.toHaveBeenCalled()
    expect(screen.getByText('Introduction')).toBeInTheDocument()
  })

  it('deletes a confirmed block from the service and the list', async () => {
    const user = userEvent.setup()
    getAllContentBlocksMetadataMock.mockResolvedValue({
      rtf_block: [existingBlock],
    })
    deleteBlockContentMock.mockResolvedValue(true)
    renderBlocksList()

    await user.click(
      await screen.findByRole('button', { name: 'Delete Introduction' }),
    )

    await waitFor(() => {
      expect(deleteBlockContentMock).toHaveBeenCalledWith(
        'block-1',
        'rtf_block',
      )
    })
    expect(screen.queryByText('Introduction')).not.toBeInTheDocument()
  })

  it('keeps the block and reports an error when deletion fails', async () => {
    const user = userEvent.setup()
    getAllContentBlocksMetadataMock.mockResolvedValue({
      rtf_block: [existingBlock],
    })
    deleteBlockContentMock.mockRejectedValue(new Error('Delete failed'))
    renderBlocksList()

    await user.click(
      await screen.findByRole('button', { name: 'Delete Introduction' }),
    )

    await waitFor(() => {
      expect(showNotificationMock).toHaveBeenCalledWith({
        color: 'red',
        title: 'Não foi possível excluir o bloco.',
        message: 'Tente novamente.',
      })
    })
    expect(screen.getByText('Introduction')).toBeInTheDocument()
  })

  it('shows a retry state when loading block metadata fails', async () => {
    const consoleLog = jest.spyOn(console, 'log').mockImplementation()
    getAllContentBlocksMetadataMock.mockRejectedValue(
      new Error('Loading failed'),
    )
    renderBlocksList()

    expect(
      await screen.findByText('Não foi possível carregar os blocos de conteúdo.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Houve um erro inesperado.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()

    consoleLog.mockRestore()
  })
})
