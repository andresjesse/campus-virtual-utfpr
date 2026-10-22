import { act, renderHook } from '@testing-library/react'

import { useDelayedFlag } from '@/hooks/use-delayed-flag.ts'

describe('useDelayedFlag', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('stays false until the delay has elapsed', () => {
    const { result } = renderHook(() => useDelayedFlag(true, 250))

    expect(result.current).toBe(false)

    act(() => jest.advanceTimersByTime(249))
    expect(result.current).toBe(false)

    act(() => jest.advanceTimersByTime(1))
    expect(result.current).toBe(true)
  })

  it('never turns on when it becomes inactive before the delay', () => {
    const { result, rerender } = renderHook(({ active }) => useDelayedFlag(active, 250), {
      initialProps: { active: true },
    })

    act(() => jest.advanceTimersByTime(100))
    rerender({ active: false })
    act(() => jest.advanceTimersByTime(500))

    expect(result.current).toBe(false)
  })

  it('turns off immediately and waits the full delay again when reactivated', () => {
    const { result, rerender } = renderHook(({ active }) => useDelayedFlag(active, 250), {
      initialProps: { active: true },
    })
    act(() => jest.advanceTimersByTime(250))
    expect(result.current).toBe(true)

    rerender({ active: false })
    expect(result.current).toBe(false)

    rerender({ active: true })
    expect(result.current).toBe(false)
    act(() => jest.advanceTimersByTime(250))
    expect(result.current).toBe(true)
  })
})
