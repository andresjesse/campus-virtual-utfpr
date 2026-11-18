import { act, renderHook } from '@testing-library/react'

import {
  VIRTUAL_MAP_TOUR_STEPS,
  VIRTUAL_MAP_TOUR_STORAGE_KEY,
  VIRTUAL_MAP_TOUR_TARGETS,
} from '@/constants/virtual-map-tour-constants.ts'
import { useVirtualMapTour } from '@/hooks/use-virtual-map-tour.ts'

describe('useVirtualMapTour', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('opens on a first visit once enabled, starting at the first step', () => {
    const { result, rerender } = renderHook(({ enabled }) => useVirtualMapTour(enabled), {
      initialProps: { enabled: false },
    })

    expect(result.current.isOpen).toBe(false)

    rerender({ enabled: true })

    expect(result.current.isOpen).toBe(true)
    expect(result.current.step).toBe(VIRTUAL_MAP_TOUR_STEPS[0])
    expect(result.current.isFirst).toBe(true)
    expect(result.current.target).toBeNull()
  })

  it('stays closed for a visitor who already completed it', () => {
    window.localStorage.setItem(VIRTUAL_MAP_TOUR_STORAGE_KEY, 'true')

    const { result } = renderHook(() => useVirtualMapTour(true))

    expect(result.current.isOpen).toBe(false)
  })

  it('moves forward and back between steps without going below the first', () => {
    const { result } = renderHook(() => useVirtualMapTour(true))

    act(() => result.current.back())
    expect(result.current.stepIndex).toBe(0)

    act(() => result.current.next())
    expect(result.current.step).toBe('camera')
    expect(result.current.target).toBe(VIRTUAL_MAP_TOUR_TARGETS.canvas)

    act(() => result.current.back())
    expect(result.current.stepIndex).toBe(0)
  })

  it('closes and remembers completion after the last step', () => {
    const { result } = renderHook(() => useVirtualMapTour(true))

    for (let index = 0; index < VIRTUAL_MAP_TOUR_STEPS.length - 1; index++) {
      act(() => result.current.next())
    }
    expect(result.current.isLast).toBe(true)
    expect(result.current.isOpen).toBe(true)

    act(() => result.current.next())

    expect(result.current.isOpen).toBe(false)
    expect(window.localStorage.getItem(VIRTUAL_MAP_TOUR_STORAGE_KEY)).toBe('true')
  })

  it('closes and remembers completion when skipped midway', () => {
    const { result } = renderHook(() => useVirtualMapTour(true))

    act(() => result.current.next())
    act(() => result.current.close())

    expect(result.current.isOpen).toBe(false)
    expect(window.localStorage.getItem(VIRTUAL_MAP_TOUR_STORAGE_KEY)).toBe('true')
  })
})
