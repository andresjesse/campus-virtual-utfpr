import { MantineProvider } from '@mantine/core'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { notifications } from '@mantine/notifications'

import BlocksList from '@/components/content-page/content-page-form/BlocksList.tsx'
import messages from '@/constants/messages.json'
import { formatMessage } from '@/helpers/message-helper.ts'
import { DialogContext } from '@/contexts/dialog-context.ts'
import { getAllContentBlocksMetadata } from '@/helpers/content-pages-service-helper.ts'
import { deleteBlockContent, reorderBlocks } from '@/services/content-page-service.ts'
import type { ContentPageBlockMetadata } from '@/types/content-page.ts'
import type { DialogContextValue } from '@/types/user-feedback.ts'

jest.mock('@/helpers/content-pages-service-helper.ts', () => ({
  getAllContentBlocksMetadata: jest.fn(),
}))

jest.mock('@/services/content-page-service.ts', () => ({
  deleteBlockContent: jest.fn(),
  reorderBlocks: jest.fn(),
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
    actions,
    onDelete,
    onEdit,
  }: {
    metadata: ContentPageBlockMetadata
    actions?: React.ReactNode
    onDelete: () => Promise<void>
    onEdit: (id: string, collectionName: 'rtf_block') => void
  }) => (
    <article>
      <span>{metadata.title}</span>
      {actions}
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
const reorderBlocksMock = jest.mocked(reorderBlocks)
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

function getRenderedTitles() {
  return screen.getAllByRole('article').map((block) => block.firstChild?.textContent)
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

  it('renders blocks of different collections by their stored position', async () => {
    getAllContentBlocksMetadataMock.mockResolvedValue({
      rtf_block: [
        { id: 'rtf-1', title: 'Introduction', collectionName: 'rtf_block', position: 0 },
        { id: 'rtf-2', title: 'Conclusion', collectionName: 'rtf_block', position: 2 },
      ],
      file_block: [
        { id: 'file-1', title: 'Gallery', collectionName: 'file_block', position: 1 },
      ],
    })
    renderBlocksList()

    await screen.findByText('Introduction')

    expect(getRenderedTitles()).toEqual(['Introduction', 'Gallery', 'Conclusion'])
  })

  describe('reordering', () => {
    const orderedBlocks = {
      rtf_block: [
        { id: 'rtf-1', title: 'Introduction', collectionName: 'rtf_block', position: 0 },
        { id: 'rtf-2', title: 'Conclusion', collectionName: 'rtf_block', position: 2 },
      ],
      file_block: [
        { id: 'file-1', title: 'Gallery', collectionName: 'file_block', position: 1 },
      ],
    }

    function moveButton(direction: 'up' | 'down', title: string) {
      const template = direction === 'up'
        ? messages.block.list.moveUpAriaLabel
        : messages.block.list.moveDownAriaLabel

      return screen.getByRole('button', { name: formatMessage(template, title) })
    }

    beforeEach(() => {
      reorderBlocksMock.mockImplementation(async (ordered) =>
        ordered.map((block, position) => ({ ...block, position })),
      )
    })

    it('disables moving the first block up and the last block down', async () => {
      getAllContentBlocksMetadataMock.mockResolvedValue(orderedBlocks)
      renderBlocksList()
      await screen.findByText('Introduction')

      expect(moveButton('up', 'Introduction')).toBeDisabled()
      expect(moveButton('down', 'Introduction')).toBeEnabled()
      expect(moveButton('up', 'Conclusion')).toBeEnabled()
      expect(moveButton('down', 'Conclusion')).toBeDisabled()
    })

    it('moves a block down and saves the new order', async () => {
      const user = userEvent.setup()
      getAllContentBlocksMetadataMock.mockResolvedValue(orderedBlocks)
      renderBlocksList()
      await screen.findByText('Introduction')

      await user.click(moveButton('down', 'Introduction'))

      expect(getRenderedTitles()).toEqual(['Gallery', 'Introduction', 'Conclusion'])
      expect(reorderBlocksMock).toHaveBeenCalledTimes(1)
      expect(reorderBlocksMock.mock.calls[0][0].map((block) => block.id))
        .toEqual(['file-1', 'rtf-1', 'rtf-2'])
    })

    it('moves a block up', async () => {
      const user = userEvent.setup()
      getAllContentBlocksMetadataMock.mockResolvedValue(orderedBlocks)
      renderBlocksList()
      await screen.findByText('Introduction')

      await user.click(moveButton('up', 'Conclusion'))

      expect(getRenderedTitles()).toEqual(['Introduction', 'Conclusion', 'Gallery'])
    })

    it('disables the move buttons while the new order is being saved', async () => {
      const user = userEvent.setup()
      let finishSave: () => void = () => {}
      reorderBlocksMock.mockImplementation((ordered) => new Promise((resolve) => {
        finishSave = () => resolve(ordered.map((block, position) => ({ ...block, position })))
      }))
      getAllContentBlocksMetadataMock.mockResolvedValue(orderedBlocks)
      renderBlocksList()
      await screen.findByText('Introduction')

      await user.click(moveButton('down', 'Introduction'))

      expect(moveButton('down', 'Introduction')).toBeDisabled()
      expect(moveButton('up', 'Gallery')).toBeDisabled()

      finishSave()

      await waitFor(() => expect(moveButton('down', 'Introduction')).toBeEnabled())
    })

    it('reports an error and restores the saved order when saving fails', async () => {
      const user = userEvent.setup()
      reorderBlocksMock.mockRejectedValue(new Error('Reorder failed'))
      getAllContentBlocksMetadataMock.mockResolvedValue(orderedBlocks)
      renderBlocksList()
      await screen.findByText('Introduction')

      await user.click(moveButton('down', 'Introduction'))

      await waitFor(() => {
        expect(showNotificationMock).toHaveBeenCalledWith(
          expect.objectContaining({
            title: messages.block.list.reorderErrorTitle,
            message: messages.errors.network,
          }),
        )
      })
      expect(getAllContentBlocksMetadataMock).toHaveBeenCalledTimes(2)
      await waitFor(() => {
        expect(getRenderedTitles()).toEqual(['Introduction', 'Gallery', 'Conclusion'])
      })
    })
  })

  it('creates draft metadata after a block is dropped', async () => {
    const user = userEvent.setup()
    getAllContentBlocksMetadataMock.mockResolvedValue({ rtf_block: [] })
    renderBlocksList()
    await screen.findByRole('button', { name: 'Drop rich text block' })

    await user.click(screen.getByRole('button', { name: 'Drop rich text block' }))

    expect(screen.getByTestId('editor-metadata')).toHaveTextContent(
      JSON.stringify({
        title: messages.block.list.newBlockTitle,
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
      title: messages.block.list.deleteConfirmTitle,
      firstMessage: formatMessage(
        messages.block.list.deleteConfirmFirst,
        'Introduction',
      ),
      secondMessage: messages.block.list.deleteConfirmSecond,
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
        title: messages.common.deleteErrorTitle,
        message: messages.errors.network,
      })
    })
    expect(screen.getByText('Introduction')).toBeInTheDocument()
  })

  it('shows a retry state when loading block metadata fails', async () => {
    getAllContentBlocksMetadataMock.mockRejectedValue(
      new Error('Loading failed'),
    )
    renderBlocksList()

    expect(
      await screen.findByText(messages.block.list.loadErrorTitle),
    ).toBeInTheDocument()
    expect(screen.getByText(messages.errors.network)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: messages.common.retry })).toBeInTheDocument()
  })
})
