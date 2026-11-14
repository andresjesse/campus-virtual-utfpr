import { notifications } from '@mantine/notifications'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router'

import { branding } from '@/config/branding.ts'
import messages from '@/constants/messages.json'
import { VIRTUAL_MAP_EVENTS } from '@/constants/virtual-map-constants.ts'
import { getRequestErrorMessage } from '@/helpers/request-error-helper.ts'
import { virtualMapEventBus } from '@/helpers/virtual-map-event-bus.ts'
import { useVirtualMapDeepLink } from '@/hooks/use-virtual-map-deep-link.ts'
import { useVirtualMapSelection } from '@/hooks/use-virtual-map-selection.ts'
import { getContentPageByEntity } from '@/services/content-page-service.ts'
import { getActiveEntityBySlug } from '@/services/entity-service.ts'

jest.mock('@mantine/notifications', () => ({
  notifications: { show: jest.fn() },
}))
jest.mock('@/services/entity-service.ts', () => ({
  getActiveEntityBySlug: jest.fn(),
}))
jest.mock('@/services/content-page-service.ts', () => ({
  getContentPageByEntity: jest.fn(),
}))

const showMock = jest.mocked(notifications.show)
const getActiveEntityBySlugMock = jest.mocked(getActiveEntityBySlug)
const getContentPageByEntityMock = jest.mocked(getContentPageByEntity)

const blockB = { id: 'block-b-id', slug: 'block_b' } as never
const page = { id: 'page-id', title: 'Block B', entity: 'block-b-id' } as never

function DeepLinkProbe({ isMapReady }: { isMapReady: boolean }) {
  const { selected, clearSelection } = useVirtualMapSelection()
  const navigate = useNavigate()
  useVirtualMapDeepLink(isMapReady, selected?.slug ?? null)

  return (
    <>
      <output data-testid="pathname">{useLocation().pathname}</output>
      <output data-testid="selected">{selected?.slug ?? ''}</output>
      <button onClick={clearSelection}>Close</button>
      <button onClick={() => navigate(-1)}>Back</button>
    </>
  )
}

function renderDeepLink(path: string, isMapReady = true) {
  const routes = (ready: boolean) => (
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<DeepLinkProbe isMapReady={ready} />} />
        <Route path="/map/:slug" element={<DeepLinkProbe isMapReady={ready} />} />
      </Routes>
    </MemoryRouter>
  )
  const view = render(routes(isMapReady))

  return { rerenderReady: () => view.rerender(routes(true)) }
}

const pathname = () => screen.getByTestId('pathname').textContent
const selectedSlug = () => screen.getByTestId('selected').textContent

function selectInScene(id: string, slug: string) {
  act(() => {
    virtualMapEventBus.dispatch(VIRTUAL_MAP_EVENTS.ENTITY_SELECTED, { id, slug })
  })
}

describe('useVirtualMapDeepLink', () => {
  const onSelected = jest.fn()
  let unregister: () => void

  beforeEach(() => {
    jest.clearAllMocks()
    unregister = virtualMapEventBus.register(VIRTUAL_MAP_EVENTS.ENTITY_SELECTED, onSelected)
  })

  afterEach(() => unregister())

  it('selects the entity of a valid deep link', async () => {
    getActiveEntityBySlugMock.mockResolvedValue(blockB)
    getContentPageByEntityMock.mockResolvedValue(page)

    renderDeepLink('/map/block_b')

    await waitFor(() =>
      expect(onSelected).toHaveBeenCalledWith({ id: 'block-b-id', slug: 'block_b' }),
    )
    expect(getActiveEntityBySlugMock).toHaveBeenCalledWith('block_b')
    expect(getContentPageByEntityMock).toHaveBeenCalledWith('block-b-id')
    expect(pathname()).toBe('/map/block_b')
    expect(showMock).not.toHaveBeenCalled()
  })

  it('waits for the map to be ready before resolving the slug', async () => {
    getActiveEntityBySlugMock.mockResolvedValue(blockB)
    getContentPageByEntityMock.mockResolvedValue(page)

    const { rerenderReady } = renderDeepLink('/map/block_b', false)
    expect(getActiveEntityBySlugMock).not.toHaveBeenCalled()

    rerenderReady()

    await waitFor(() => expect(onSelected).toHaveBeenCalledTimes(1))
  })

  it('does nothing without a slug', () => {
    renderDeepLink('/')

    expect(getActiveEntityBySlugMock).not.toHaveBeenCalled()
  })

  it('warns and returns home when no active entity has the slug', async () => {
    getActiveEntityBySlugMock.mockResolvedValue(null)

    renderDeepLink('/map/unknown')

    await waitFor(() => expect(pathname()).toBe('/'))
    expect(showMock).toHaveBeenCalledWith({
      color: branding.colors.feedback.warning,
      title: messages.virtualMap.deepLink.notFoundTitle,
      message: messages.virtualMap.deepLink.notFoundMessage,
    })
    expect(getContentPageByEntityMock).not.toHaveBeenCalled()
    expect(onSelected).not.toHaveBeenCalled()
  })

  it('warns and returns home when the entity has no content page', async () => {
    getActiveEntityBySlugMock.mockResolvedValue(blockB)
    getContentPageByEntityMock.mockResolvedValue(null)

    renderDeepLink('/map/block_b')

    await waitFor(() => expect(pathname()).toBe('/'))
    expect(showMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: messages.virtualMap.deepLink.notFoundTitle }),
    )
    expect(onSelected).not.toHaveBeenCalled()
  })

  it('reports a failed lookup and keeps the map where it is', async () => {
    const error = new Error('Network error')
    getActiveEntityBySlugMock.mockRejectedValue(error)

    renderDeepLink('/map/block_b')

    await waitFor(() =>
      expect(showMock).toHaveBeenCalledWith({
        color: branding.colors.feedback.error,
        title: messages.virtualMap.deepLink.loadErrorTitle,
        message: getRequestErrorMessage(error),
      }),
    )
    expect(pathname()).toBe('/map/block_b')
    expect(onSelected).not.toHaveBeenCalled()
  })

  it('moves the URL to the entity selected in the scene without resolving it again', () => {
    renderDeepLink('/')

    selectInScene('block-b-id', 'block_b')

    expect(pathname()).toBe('/map/block_b')
    expect(selectedSlug()).toBe('block_b')
    expect(getActiveEntityBySlugMock).not.toHaveBeenCalled()
  })

  it('returns to the home URL when the selection is cleared', () => {
    renderDeepLink('/')
    selectInScene('block-b-id', 'block_b')

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(pathname()).toBe('/')
    expect(selectedSlug()).toBe('')
  })

  it('clears the selection when history goes back to the home URL', () => {
    renderDeepLink('/')
    selectInScene('block-b-id', 'block_b')

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(pathname()).toBe('/')
    expect(selectedSlug()).toBe('')
  })

  it('selects the previous entity again when history goes back to its URL', async () => {
    const blockA = { id: 'block-a-id', slug: 'block_a' } as never
    getActiveEntityBySlugMock.mockResolvedValue(blockA)
    getContentPageByEntityMock.mockResolvedValue(page)
    renderDeepLink('/')
    selectInScene('block-a-id', 'block_a')
    selectInScene('block-b-id', 'block_b')

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(pathname()).toBe('/map/block_a')
    await waitFor(() => expect(selectedSlug()).toBe('block_a'))
    expect(getActiveEntityBySlugMock).toHaveBeenCalledWith('block_a')
  })

  it('does not resolve a deep link again once it is selected', async () => {
    getActiveEntityBySlugMock.mockResolvedValue(blockB)
    getContentPageByEntityMock.mockResolvedValue(page)

    renderDeepLink('/map/block_b')

    await waitFor(() => expect(selectedSlug()).toBe('block_b'))
    expect(getActiveEntityBySlugMock).toHaveBeenCalledTimes(1)
    expect(pathname()).toBe('/map/block_b')
  })
})
