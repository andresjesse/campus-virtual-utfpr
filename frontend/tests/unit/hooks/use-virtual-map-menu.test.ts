import { act, renderHook, waitFor } from '@testing-library/react'

import { useVirtualMapMenu } from '@/hooks/use-virtual-map-menu.ts'
import { listMenuItems } from '@/services/menu-item-service.ts'
import type { MenuItemRecord } from '@/types/menu.ts'

jest.mock('@/services/menu-item-service.ts', () => ({
  listMenuItems: jest.fn(),
}))

const listMenuItemsMock = jest.mocked(listMenuItems)

const item = {
  id: 'item-1',
  label: 'Admissions',
  category: 'main',
  parent: '',
  expand: { category: { id: 'main', label: 'Main Menu' } },
} as unknown as MenuItemRecord

describe('useVirtualMapMenu', () => {
  beforeEach(() => jest.clearAllMocks())

  it('loads the items and exposes them grouped by category', async () => {
    listMenuItemsMock.mockResolvedValue([item])

    const { result } = renderHook(() => useVirtualMapMenu())

    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current.status).toBe('ready'))

    expect(result.current.categories).toHaveLength(1)
    expect(result.current.categories[0].label).toBe('Main Menu')
    expect(result.current.categories[0].items[0].item.id).toBe('item-1')
  })

  it('reports an error and recovers on retry', async () => {
    listMenuItemsMock.mockRejectedValueOnce(new Error('offline'))
    listMenuItemsMock.mockResolvedValueOnce([item])

    const { result } = renderHook(() => useVirtualMapMenu())

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.error).toEqual(expect.any(String))

    act(() => result.current.retry())
    expect(result.current.status).toBe('loading')

    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(listMenuItemsMock).toHaveBeenCalledTimes(2)
  })
})
