import { act, renderHook } from '@testing-library/react'

import {
  VIRTUAL_MAP_GRAPHICS_DEFAULTS,
  VIRTUAL_MAP_GRAPHICS_STORAGE_KEY,
  VIRTUAL_MAP_PIXEL_DENSITY_RATIOS,
} from '@/constants/virtual-map-graphics-constants.ts'
import { applyGraphicsSettings } from '@/helpers/virtual-map-graphics-helper.ts'
import { useVirtualMapGraphicsSettings } from '@/hooks/use-virtual-map-graphics-settings.ts'
import type { VirtualMapGraphicsSettings } from '@/types/virtual-map-graphics.ts'

jest.mock('@/helpers/virtual-map-graphics-helper.ts', () => ({
  ...jest.requireActual('@/helpers/virtual-map-graphics-helper.ts'),
  applyGraphicsSettings: jest.fn(),
}))

const applyMock = jest.mocked(applyGraphicsSettings)

const stored: VirtualMapGraphicsSettings = {
  shadowsEnabled: false,
  pixelDensity: 'low',
  fpsCounterVisible: true,
}

describe('useVirtualMapGraphicsSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.localStorage.clear()
  })

  it('starts from the defaults on a first visit', () => {
    const { result } = renderHook(() => useVirtualMapGraphicsSettings())

    expect(result.current.settings).toEqual(VIRTUAL_MAP_GRAPHICS_DEFAULTS)
    expect(result.current.draft).toEqual(VIRTUAL_MAP_GRAPHICS_DEFAULTS)
    expect(result.current.isDirty).toBe(false)
  })

  it('starts the draft from the stored settings', () => {
    window.localStorage.setItem(VIRTUAL_MAP_GRAPHICS_STORAGE_KEY, JSON.stringify(stored))

    const { result } = renderHook(() => useVirtualMapGraphicsSettings())

    expect(result.current.settings).toEqual(stored)
    expect(result.current.draft).toEqual(stored)
  })

  it('reports the pixel ratio of the stored density, not of the draft', () => {
    const originalRatio = window.devicePixelRatio
    Object.defineProperty(window, 'devicePixelRatio', { value: 3, configurable: true })
    window.localStorage.setItem(VIRTUAL_MAP_GRAPHICS_STORAGE_KEY, JSON.stringify(stored))
    const { result } = renderHook(() => useVirtualMapGraphicsSettings())

    act(() => result.current.updateDraft('pixelDensity', 'high'))

    expect(result.current.currentPixelRatio).toBe(VIRTUAL_MAP_PIXEL_DENSITY_RATIOS.low)

    Object.defineProperty(window, 'devicePixelRatio', { value: originalRatio, configurable: true })
  })

  it('becomes dirty when the draft changes and clean again when it goes back', () => {
    const { result } = renderHook(() => useVirtualMapGraphicsSettings())

    act(() => result.current.updateDraft('shadowsEnabled', false))

    expect(result.current.draft.shadowsEnabled).toBe(false)
    expect(result.current.isDirty).toBe(true)

    act(() => result.current.updateDraft('shadowsEnabled', true))

    expect(result.current.isDirty).toBe(false)
  })

  it('discards the draft on reset without saving', () => {
    const { result } = renderHook(() => useVirtualMapGraphicsSettings())
    act(() => result.current.updateDraft('pixelDensity', 'medium'))
    act(() => result.current.updateDraft('fpsCounterVisible', true))

    act(() => result.current.reset())

    expect(result.current.draft).toEqual(VIRTUAL_MAP_GRAPHICS_DEFAULTS)
    expect(result.current.isDirty).toBe(false)
    expect(applyMock).not.toHaveBeenCalled()
  })

  it('applies the draft on save', () => {
    const { result } = renderHook(() => useVirtualMapGraphicsSettings())
    act(() => result.current.updateDraft('shadowsEnabled', false))
    act(() => result.current.updateDraft('pixelDensity', 'low'))

    act(() => result.current.save())

    expect(applyMock).toHaveBeenCalledWith({
      ...VIRTUAL_MAP_GRAPHICS_DEFAULTS,
      shadowsEnabled: false,
      pixelDensity: 'low',
    })
  })
})
