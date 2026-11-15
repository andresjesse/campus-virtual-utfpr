import { VIRTUAL_MAP_MAX_PIXEL_RATIO } from '@/constants/virtual-map-constants.ts'
import {
  VIRTUAL_MAP_GRAPHICS_DEFAULTS,
  VIRTUAL_MAP_GRAPHICS_STORAGE_KEY,
  VIRTUAL_MAP_PIXEL_DENSITY_RATIOS,
} from '@/constants/virtual-map-graphics-constants.ts'
import {
  applyGraphicsSettings,
  areGraphicsSettingsEqual,
  loadGraphicsSettings,
  readDeviceInfo,
  resolvePixelRatio,
  saveGraphicsSettings,
} from '@/helpers/virtual-map-graphics-helper.ts'
import type { VirtualMapDeviceInfo, VirtualMapGraphicsSettings } from '@/types/virtual-map-graphics.ts'

function createDevice(overrides: Partial<VirtualMapDeviceInfo> = {}): VirtualMapDeviceInfo {
  return {
    devicePixelRatio: 3,
    hardwareConcurrency: 8,
    deviceMemory: 8,
    coarsePointer: false,
    ...overrides,
  }
}

function createThrowingStorage(): Storage {
  return {
    length: 0,
    clear: jest.fn(),
    key: jest.fn(),
    removeItem: jest.fn(),
    getItem: jest.fn(() => {
      throw new Error('storage disabled')
    }),
    setItem: jest.fn(() => {
      throw new Error('storage disabled')
    }),
  }
}

describe('resolvePixelRatio', () => {
  it('uses the ratio of each fixed level', () => {
    const device = createDevice()

    expect(resolvePixelRatio('low', device)).toBe(VIRTUAL_MAP_PIXEL_DENSITY_RATIOS.low)
    expect(resolvePixelRatio('medium', device)).toBe(VIRTUAL_MAP_PIXEL_DENSITY_RATIOS.medium)
    expect(resolvePixelRatio('high', device)).toBe(VIRTUAL_MAP_PIXEL_DENSITY_RATIOS.high)
  })

  it('never goes above the map maximum', () => {
    expect(resolvePixelRatio('high', createDevice({ devicePixelRatio: 4 }))).toBe(
      VIRTUAL_MAP_MAX_PIXEL_RATIO,
    )
  })

  it('never goes above the device ratio', () => {
    const device = createDevice({ devicePixelRatio: 1.25 })

    expect(resolvePixelRatio('medium', device)).toBe(1.25)
    expect(resolvePixelRatio('high', device)).toBe(1.25)
  })

  it('falls back to a ratio of 1 when the device reports none', () => {
    expect(resolvePixelRatio('high', createDevice({ devicePixelRatio: 0 }))).toBe(1)
  })

  describe('auto', () => {
    it('picks the high level on a capable desktop', () => {
      expect(resolvePixelRatio('auto', createDevice())).toBe(VIRTUAL_MAP_PIXEL_DENSITY_RATIOS.high)
    })

    it('picks the medium level on a capable touch device', () => {
      expect(resolvePixelRatio('auto', createDevice({ coarsePointer: true }))).toBe(
        VIRTUAL_MAP_PIXEL_DENSITY_RATIOS.medium,
      )
    })

    it('picks the low level on a device with few cores', () => {
      expect(resolvePixelRatio('auto', createDevice({ hardwareConcurrency: 4 }))).toBe(
        VIRTUAL_MAP_PIXEL_DENSITY_RATIOS.low,
      )
    })

    it('picks the low level on a device with little memory', () => {
      expect(
        resolvePixelRatio('auto', createDevice({ deviceMemory: 2, coarsePointer: true })),
      ).toBe(VIRTUAL_MAP_PIXEL_DENSITY_RATIOS.low)
    })

    it('decides from the cores alone when the memory is unknown', () => {
      expect(resolvePixelRatio('auto', createDevice({ deviceMemory: undefined }))).toBe(
        VIRTUAL_MAP_PIXEL_DENSITY_RATIOS.high,
      )
      expect(
        resolvePixelRatio('auto', createDevice({ deviceMemory: undefined, hardwareConcurrency: 2 })),
      ).toBe(VIRTUAL_MAP_PIXEL_DENSITY_RATIOS.low)
    })

    it('does not treat an unknown core count as low-end', () => {
      expect(
        resolvePixelRatio(
          'auto',
          createDevice({ hardwareConcurrency: undefined, deviceMemory: undefined }),
        ),
      ).toBe(VIRTUAL_MAP_PIXEL_DENSITY_RATIOS.high)
    })
  })
})

describe('readDeviceInfo', () => {
  it('reads the pixel ratio, cores, memory and pointer type from the browser', () => {
    const matchMediaSpy = jest
      .spyOn(window, 'matchMedia')
      .mockReturnValue({ matches: true } as MediaQueryList)
    Object.defineProperty(navigator, 'deviceMemory', { value: 4, configurable: true })

    expect(readDeviceInfo()).toEqual({
      devicePixelRatio: window.devicePixelRatio,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: 4,
      coarsePointer: true,
    })
    expect(matchMediaSpy).toHaveBeenCalledWith('(pointer: coarse)')

    matchMediaSpy.mockRestore()
    delete (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  })
})

describe('graphics settings storage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns the defaults on a first visit', () => {
    expect(loadGraphicsSettings()).toEqual(VIRTUAL_MAP_GRAPHICS_DEFAULTS)
  })

  it('saves and loads the settings under the namespaced key', () => {
    const settings: VirtualMapGraphicsSettings = {
      shadowsEnabled: false,
      pixelDensity: 'low',
      fpsCounterVisible: true,
    }

    saveGraphicsSettings(settings)

    expect(JSON.parse(window.localStorage.getItem(VIRTUAL_MAP_GRAPHICS_STORAGE_KEY) ?? '')).toEqual(
      settings,
    )
    expect(loadGraphicsSettings()).toEqual(settings)
  })

  it('falls back to the defaults when the stored value is not valid JSON', () => {
    window.localStorage.setItem(VIRTUAL_MAP_GRAPHICS_STORAGE_KEY, '{not json')

    expect(loadGraphicsSettings()).toEqual(VIRTUAL_MAP_GRAPHICS_DEFAULTS)
  })

  it('falls back to the defaults when the stored value is not an object', () => {
    window.localStorage.setItem(VIRTUAL_MAP_GRAPHICS_STORAGE_KEY, '"low"')

    expect(loadGraphicsSettings()).toEqual(VIRTUAL_MAP_GRAPHICS_DEFAULTS)
  })

  it('keeps the valid fields and replaces only the invalid or missing ones', () => {
    window.localStorage.setItem(
      VIRTUAL_MAP_GRAPHICS_STORAGE_KEY,
      JSON.stringify({ shadowsEnabled: false, pixelDensity: 'ultra' }),
    )

    expect(loadGraphicsSettings()).toEqual({
      shadowsEnabled: false,
      pixelDensity: VIRTUAL_MAP_GRAPHICS_DEFAULTS.pixelDensity,
      fpsCounterVisible: VIRTUAL_MAP_GRAPHICS_DEFAULTS.fpsCounterVisible,
    })
  })

  it('returns a copy, so changing it does not change the defaults', () => {
    const settings = loadGraphicsSettings()
    settings.shadowsEnabled = !settings.shadowsEnabled

    expect(loadGraphicsSettings()).toEqual(VIRTUAL_MAP_GRAPHICS_DEFAULTS)
  })

  it('treats unavailable storage as a first visit without throwing', () => {
    const storage = createThrowingStorage()

    expect(loadGraphicsSettings(storage)).toEqual(VIRTUAL_MAP_GRAPHICS_DEFAULTS)
    expect(() => saveGraphicsSettings(VIRTUAL_MAP_GRAPHICS_DEFAULTS, storage)).not.toThrow()
  })
})

describe('applyGraphicsSettings', () => {
  const settings: VirtualMapGraphicsSettings = {
    shadowsEnabled: false,
    pixelDensity: 'medium',
    fpsCounterVisible: true,
  }

  beforeEach(() => {
    window.localStorage.clear()
  })

  it('saves the settings and then reloads', () => {
    const reload = jest.fn(() => {
      expect(loadGraphicsSettings()).toEqual(settings)
    })

    applyGraphicsSettings(settings, window.localStorage, reload)

    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('still reloads when the storage is unavailable', () => {
    const reload = jest.fn()

    applyGraphicsSettings(settings, createThrowingStorage(), reload)

    expect(reload).toHaveBeenCalledTimes(1)
  })
})

describe('areGraphicsSettingsEqual', () => {
  it('compares every setting', () => {
    const base = VIRTUAL_MAP_GRAPHICS_DEFAULTS

    expect(areGraphicsSettingsEqual(base, { ...base })).toBe(true)
    expect(areGraphicsSettingsEqual(base, { ...base, shadowsEnabled: !base.shadowsEnabled })).toBe(false)
    expect(areGraphicsSettingsEqual(base, { ...base, pixelDensity: 'low' })).toBe(false)
    expect(
      areGraphicsSettingsEqual(base, { ...base, fpsCounterVisible: !base.fpsCounterVisible }),
    ).toBe(false)
  })
})
