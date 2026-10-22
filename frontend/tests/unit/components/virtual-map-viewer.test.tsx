import { MantineProvider } from '@mantine/core'
import { act, fireEvent, render, screen } from '@testing-library/react'

import VirtualMapViewer from '@/components/virtual-map/virtual-map-viewer/VirtualMapViewer.tsx'
import messages from '@/constants/messages.json'
import {
  VIRTUAL_MAP_ENTITY_LOADING_DELAY_MS,
  VIRTUAL_MAP_EVENTS,
} from '@/constants/virtual-map-constants.ts'
import { formatMessage } from '@/helpers/message-helper.ts'
import { virtualMapEventBus } from '@/helpers/virtual-map-event-bus.ts'
import { useVirtualMap } from '@/hooks/use-virtual-map.ts'
import { useVirtualMapEntityPage } from '@/hooks/use-virtual-map-entity-page.ts'

jest.mock('@/hooks/use-virtual-map.ts', () => ({
  useVirtualMap: jest.fn(),
}))

jest.mock('@/hooks/content-blocks/useContentBlockData.tsx', () => ({
  __esModule: true,
  default: jest.fn(),
}))
jest.mock('@/hooks/use-virtual-map-entity-page.ts', () => ({
  useVirtualMapEntityPage: jest.fn(),
}))

const useVirtualMapMock = jest.mocked(useVirtualMap)
const useVirtualMapEntityPageMock = jest.mocked(useVirtualMapEntityPage)

function mockEntityPage(state: Partial<ReturnType<typeof useVirtualMapEntityPage>> = {}) {
  useVirtualMapEntityPageMock.mockReturnValue({
    status: 'ready',
    page: { id: 'page-id', title: 'Main Library' } as never,
    blocks: [],
    error: null,
    retry: jest.fn(),
    ...state,
  })
}

function renderViewer(state: Partial<ReturnType<typeof useVirtualMap>>) {
  const retry = jest.fn()
  useVirtualMapMock.mockReturnValue({
    status: 'loading',
    progress: 0,
    error: '',
    retry,
    ...state,
  })

  render(
    <MantineProvider>
      <VirtualMapViewer />
    </MantineProvider>,
  )

  return { retry }
}

describe('VirtualMapViewer', () => {
  beforeEach(() => mockEntityPage())

  it('passes its canvas to the virtual map hook', () => {
    renderViewer({ status: 'ready' })

    const canvas = screen.getByLabelText(messages.virtualMap.viewer.canvasAriaLabel)
    expect(canvas.tagName).toBe('CANVAS')
    expect(useVirtualMapMock.mock.calls[0][0].current).toBe(canvas)
  })

  it('shows the loading percentage while models load', () => {
    renderViewer({ status: 'loading', progress: 42 })

    expect(screen.getByRole('status')).toHaveTextContent(
      messages.virtualMap.viewer.loadingTitle,
    )
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '42')
    expect(
      screen.getByText(formatMessage(messages.virtualMap.viewer.loadingProgress, '42')),
    ).toBeInTheDocument()
  })

  it('hides the overlay once the map is ready', () => {
    renderViewer({ status: 'ready', progress: 100 })

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('shows the error with a retry action', () => {
    const { retry } = renderViewer({ status: 'error', error: messages.errors.network })

    expect(screen.getByText(messages.virtualMap.viewer.loadErrorTitle)).toBeInTheDocument()
    expect(screen.getByText(messages.errors.network)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: messages.common.retry }))

    expect(retry).toHaveBeenCalledTimes(1)
  })

  it('opens the content page modal when the map dispatches a selection', () => {
    renderViewer({ status: 'ready' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    act(() =>
      virtualMapEventBus.dispatch(VIRTUAL_MAP_EVENTS.ENTITY_SELECTED, {
        id: 'library-id',
        slug: 'library',
      }),
    )

    expect(screen.getByRole('dialog', { name: 'Main Library' })).toBeInTheDocument()
    expect(useVirtualMapEntityPageMock).toHaveBeenLastCalledWith({
      id: 'library-id',
      slug: 'library',
    })
  })

  it('opens nothing when the selected entity has no page', () => {
    mockEntityPage({ status: 'none', page: null })
    renderViewer({ status: 'ready' })

    act(() =>
      virtualMapEventBus.dispatch(VIRTUAL_MAP_EVENTS.ENTITY_SELECTED, {
        id: 'library-id',
        slug: 'library',
      }),
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('only shows the loading modal after the delay, so a lookup with no page never flashes it', () => {
    jest.useFakeTimers()
    mockEntityPage({ status: 'loading', page: null })
    renderViewer({ status: 'ready' })

    act(() =>
      virtualMapEventBus.dispatch(VIRTUAL_MAP_EVENTS.ENTITY_SELECTED, {
        id: 'library-id',
        slug: 'library',
      }),
    )
    act(() => jest.advanceTimersByTime(VIRTUAL_MAP_ENTITY_LOADING_DELAY_MS - 1))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    act(() => jest.advanceTimersByTime(1))
    expect(screen.getByRole('dialog', { name: 'library' })).toBeInTheDocument()
    jest.useRealTimers()
  })

  it('closes the modal and dispatches SELECTION_CLEARED from the close button', () => {
    const cleared = jest.fn()
    const unregister = virtualMapEventBus.register(VIRTUAL_MAP_EVENTS.SELECTION_CLEARED, cleared)
    renderViewer({ status: 'ready' })
    act(() =>
      virtualMapEventBus.dispatch(VIRTUAL_MAP_EVENTS.ENTITY_SELECTED, {
        id: 'library-id',
        slug: 'library',
      }),
    )

    fireEvent.click(
      screen.getByRole('button', { name: messages.virtualMap.entityModal.closeAriaLabel }),
    )

    expect(cleared).toHaveBeenCalledTimes(1)
    unregister()
  })
})
