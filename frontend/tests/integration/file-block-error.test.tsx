import { MantineProvider } from '@mantine/core'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import ContentBlockEditOverlay from '@/components/content-input/content-blocks/overlay/ContentBlockEditOverlay.tsx'
import messages from '@/constants/messages.json'
import { getBlockContent } from '@/services/content-page-service.ts'
import type { ContentPageBlockMetadata } from '@/types/content-page.ts'

jest.mock('@/services/content-page-service.ts', () => ({
  getBlockContent: jest.fn(),
  upsertBlockContent: jest.fn(),
}))

function renderOverlay(blockMetadata: ContentPageBlockMetadata) {
  render(
    <MantineProvider>
      <ContentBlockEditOverlay
        blockMetadata={blockMetadata}
        pageTitle="Page"
        pageRelation="entity:a"
        onUpdate={jest.fn()}
        opened
        onClose={jest.fn()}
      />
    </MantineProvider>,
  )
}

describe('file block inline error', () => {
  it('shows it when creating a block without files', async () => {
    renderOverlay({ title: 't', collectionName: 'file_block', page: 'p' })
    fireEvent.click(screen.getByRole('button', { name: messages.common.save }))
    expect(await screen.findByText(messages.block.file.empty.create, { selector: 'p' })).toBeInTheDocument()
  })

  it('shows it when every existing file is marked for deletion', async () => {
    jest.mocked(getBlockContent).mockResolvedValue({ newFiles: [], deletedUrls: [], urls: [] } as never)
    renderOverlay({ id: 'b', title: 't', collectionName: 'file_block', page: 'p' })
    await waitFor(() => expect(getBlockContent).toHaveBeenCalled())
    fireEvent.click(await screen.findByRole('button', { name: messages.common.save }))
    expect(await screen.findByText(messages.block.file.empty.update, { selector: 'p' })).toBeInTheDocument()
  })
})
