import { MantineProvider } from '@mantine/core'
import { fireEvent, render, screen } from '@testing-library/react'

import VirtualMapEntityModal from '@/components/virtual-map/virtual-map-viewer/VirtualMapEntityModal.tsx'
import messages from '@/constants/messages.json'
import useContentBlockData from '@/hooks/content-blocks/useContentBlockData.tsx'

jest.mock('@/hooks/content-blocks/useContentBlockData.tsx', () => ({
  __esModule: true,
  default: jest.fn(),
}))

const useContentBlockDataMock = jest.mocked(useContentBlockData)

const entity = { id: 'library-id', slug: 'library' }
const baseEntityPage = {
  status: 'ready' as const,
  page: { id: 'page-id', title: 'Main Library' } as never,
  blocks: [],
  error: null,
  retry: jest.fn(),
}

function renderModal(entityPage: Partial<typeof baseEntityPage> = {}) {
  const onClose = jest.fn()
  const retry = jest.fn()
  render(
    <MantineProvider>
      <VirtualMapEntityModal
        opened
        fallbackTitle={entity.slug}
        entityPage={{ ...baseEntityPage, retry, ...entityPage }}
        onClose={onClose}
      />
    </MantineProvider>,
  )
  return { onClose, retry }
}

describe('VirtualMapEntityModal', () => {
  beforeEach(() => {
    useContentBlockDataMock.mockReset()
    useContentBlockDataMock.mockReturnValue({
      blockData: '',
      isLoading: false,
    } as never)
  })

  it('shows the page title', () => {
    renderModal()

    expect(screen.getByRole('dialog', { name: 'Main Library' })).toBeInTheDocument()
  })

  it('renders a rich text, a file and a diagram block without edit or delete controls', () => {
    useContentBlockDataMock.mockImplementation(
      (metadata) =>
        ({
          blockData:
            metadata.collectionName === 'rtf_block'
              ? '<p>Opening hours</p>'
              : { newFiles: [], deletedUrls: [], urls: ['http://files.test/photo.png'] },
          isLoading: false,
        }) as never,
    )

    renderModal({
      blocks: [
        { id: 'rtf-1', title: 'Hours', collectionName: 'rtf_block' },
        { id: 'file-1', title: 'Photos', collectionName: 'file_block' },
        { id: 'diagram-1', title: 'Map', collectionName: 'diagram_block' },
      ] as never,
    })

    expect(screen.getByText('Hours')).toBeInTheDocument()
    expect(screen.getByText('Opening hours')).toBeInTheDocument()
    expect(screen.getByText('Photos')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('src', 'http://files.test/photo.png')
    expect(screen.getByText('Map')).toBeInTheDocument()
    expect(screen.getByText(messages.block.diagram.notImplemented)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /editar|excluir/i })).not.toBeInTheDocument()
  })

  it('closes from the close button', () => {
    const { onClose } = renderModal()

    fireEvent.click(
      screen.getByRole('button', { name: messages.virtualMap.entityModal.closeAriaLabel }),
    )

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows the slug and a loading state while the page loads', () => {
    renderModal({ status: 'loading' as never, page: null })

    expect(screen.getByRole('dialog', { name: 'library' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows the empty state when the page has no blocks', () => {
    renderModal()

    expect(screen.getByText(messages.virtualMap.entityModal.emptyTitle)).toBeInTheDocument()
  })

  it('shows the error with a retry action', () => {
    const { retry } = renderModal({
      status: 'error' as never,
      page: null,
      error: messages.errors.network,
    })

    expect(
      screen.getByText(messages.virtualMap.entityModal.loadErrorTitle),
    ).toBeInTheDocument()
    expect(screen.getByText(messages.errors.network)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: messages.common.retry }))

    expect(retry).toHaveBeenCalledTimes(1)
  })
})
