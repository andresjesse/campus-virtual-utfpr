import { MantineProvider } from '@mantine/core'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import VirtualMapMenu from '@/components/virtual-map/virtual-map-menu/VirtualMapMenu.tsx'
import messages from '@/constants/messages.json'
import { useVirtualMapMenu } from '@/hooks/use-virtual-map-menu.ts'
import { useVirtualMapPageBlocks } from '@/hooks/use-virtual-map-page-blocks.ts'
import type { MenuItemRecord, MenuTreeItem } from '@/types/menu.ts'

jest.mock('@/hooks/use-virtual-map-menu.ts', () => ({ useVirtualMapMenu: jest.fn() }))
jest.mock('@/hooks/use-virtual-map-page-blocks.ts', () => ({
  useVirtualMapPageBlocks: jest.fn(),
}))
jest.mock('@/hooks/content-blocks/useContentBlockData.tsx', () => ({
  __esModule: true,
  default: jest.fn(),
}))
jest.mock('@/services/menu-item-service.ts', () => ({
  getMenuItemIconUrl: () => 'https://example.com/icon.svg',
}))

const useVirtualMapMenuMock = jest.mocked(useVirtualMapMenu)
const useVirtualMapPageBlocksMock = jest.mocked(useVirtualMapPageBlocks)

const page = { id: 'page-id', title: 'Study Here' } as never

function node(overrides: Partial<MenuItemRecord>, children: MenuTreeItem[] = []): MenuTreeItem {
  return {
    item: { id: 'item', label: 'Item', href: '', page: '', ...overrides } as MenuItemRecord,
    children,
  }
}

function mockMenu(state: Partial<ReturnType<typeof useVirtualMapMenu>> = {}) {
  useVirtualMapMenuMock.mockReturnValue({
    status: 'ready',
    categories: [
      {
        id: 'main',
        label: 'Main Menu',
        items: [
          node({ id: 'site', label: 'Admissions Site', href: 'https://example.com/admissions' }),
          node(
            { id: 'study', label: 'Study Here', page: 'page-id', expand: { page } as never },
            [node({ id: 'nested', label: 'Scholarships', href: 'https://example.com/aid' })],
          ),
        ],
      },
    ],
    error: null,
    retry: jest.fn(),
    ...state,
  })
}

function renderMenu() {
  render(
    <MantineProvider>
      <VirtualMapMenu />
    </MantineProvider>,
  )
  fireEvent.click(screen.getByRole('button', { name: messages.virtualMap.menu.toggleLabel }))
}

describe('VirtualMapMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useVirtualMapPageBlocksMock.mockReturnValue({
      status: 'ready',
      page,
      blocks: [],
      error: null,
      retry: jest.fn(),
    })
    mockMenu()
  })

  it('starts collapsed and toggles the panel from the button', () => {
    render(
      <MantineProvider>
        <VirtualMapMenu />
      </MantineProvider>,
    )
    const toggle = screen.getByRole('button', { name: messages.virtualMap.menu.toggleLabel })

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('renders categories with their items and nested children', () => {
    renderMenu()

    expect(screen.getByText('Main Menu')).toBeInTheDocument()
    expect(screen.getByText('Admissions Site')).toBeInTheDocument()
    expect(screen.getByText('Scholarships')).toBeInTheDocument()
  })

  it('opens link items in a new tab safely', () => {
    renderMenu()

    const link = screen.getByRole('link', { name: /Admissions Site/, hidden: true })
    expect(link).toHaveAttribute('href', 'https://example.com/admissions')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('opens the linked page in a modal when a page item is clicked', async () => {
    renderMenu()

    fireEvent.click(screen.getByRole('button', { name: /Study Here/, hidden: true }))

    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    expect(useVirtualMapPageBlocksMock).toHaveBeenLastCalledWith(page)
    expect(screen.getByText(messages.virtualMap.entityModal.emptyTitle)).toBeInTheDocument()
  })

  it('shows the empty state when there are no items', () => {
    mockMenu({ categories: [] })
    renderMenu()

    expect(screen.getByText(messages.virtualMap.menu.emptyTitle)).toBeInTheDocument()
  })

  it('shows the error and retries', () => {
    const retry = jest.fn()
    mockMenu({ status: 'error', categories: [], error: 'Server down', retry })
    renderMenu()

    expect(screen.getByText(messages.virtualMap.menu.loadErrorTitle)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: messages.common.retry, hidden: true }))
    expect(retry).toHaveBeenCalled()
  })
})
