import { act, renderHook } from '@testing-library/react'

import { VIRTUAL_MAP_EVENTS } from '@/constants/virtual-map-constants.ts'
import { virtualMapEventBus } from '@/helpers/virtual-map-event-bus.ts'
import { useVirtualMapSelection } from '@/hooks/use-virtual-map-selection.ts'

const library = { id: 'library-id', slug: 'library' }
const gym = { id: 'gym-id', slug: 'gym' }

describe('useVirtualMapSelection', () => {
  it('starts with nothing selected', () => {
    const { result } = renderHook(() => useVirtualMapSelection())

    expect(result.current.selected).toBeNull()
  })

  it('follows the selection events dispatched on the bus', () => {
    const { result } = renderHook(() => useVirtualMapSelection())

    act(() => virtualMapEventBus.dispatch(VIRTUAL_MAP_EVENTS.ENTITY_SELECTED, library))
    expect(result.current.selected).toEqual(library)

    act(() => virtualMapEventBus.dispatch(VIRTUAL_MAP_EVENTS.ENTITY_SELECTED, gym))
    expect(result.current.selected).toEqual(gym)

    act(() => virtualMapEventBus.dispatch(VIRTUAL_MAP_EVENTS.SELECTION_CLEARED))
    expect(result.current.selected).toBeNull()
  })

  it('dispatches SELECTION_CLEARED on the bus when clearing', () => {
    const cleared = jest.fn()
    const unregister = virtualMapEventBus.register(VIRTUAL_MAP_EVENTS.SELECTION_CLEARED, cleared)
    const { result } = renderHook(() => useVirtualMapSelection())

    act(() => virtualMapEventBus.dispatch(VIRTUAL_MAP_EVENTS.ENTITY_SELECTED, library))
    act(() => result.current.clearSelection())

    expect(cleared).toHaveBeenCalledTimes(1)
    expect(result.current.selected).toBeNull()
    unregister()
  })

  it('stops listening to the bus on unmount', () => {
    const { result, unmount } = renderHook(() => useVirtualMapSelection())

    unmount()
    act(() => virtualMapEventBus.dispatch(VIRTUAL_MAP_EVENTS.ENTITY_SELECTED, library))

    expect(result.current.selected).toBeNull()
  })
})
