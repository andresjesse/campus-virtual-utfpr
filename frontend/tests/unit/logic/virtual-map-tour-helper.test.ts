import {
  VIRTUAL_MAP_TOUR_STEP_TARGETS,
  VIRTUAL_MAP_TOUR_STORAGE_KEY,
  VIRTUAL_MAP_TOUR_TARGETS,
} from '@/constants/virtual-map-tour-constants.ts'
import {
  getTourMaskPath,
  getTourSpotlight,
  getTourTargetSelector,
  hasCompletedTour,
  markTourCompleted,
} from '@/helpers/virtual-map-tour-helper.ts'

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

describe('virtual map tour helper', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('reports a first visit as not completed', () => {
    expect(hasCompletedTour()).toBe(false)
  })

  it('remembers a completed tour under the namespaced key', () => {
    markTourCompleted()

    expect(window.localStorage.getItem(VIRTUAL_MAP_TOUR_STORAGE_KEY)).toBe('true')
    expect(hasCompletedTour()).toBe(true)
  })

  it('ignores values other than the completed flag', () => {
    window.localStorage.setItem(VIRTUAL_MAP_TOUR_STORAGE_KEY, 'yes')

    expect(hasCompletedTour()).toBe(false)
  })

  it('treats unavailable storage as not completed without throwing', () => {
    const storage = createThrowingStorage()

    expect(hasCompletedTour(storage)).toBe(false)
    expect(() => markTourCompleted(storage)).not.toThrow()
  })
})

describe('virtual map tour targets', () => {
  it('builds a data-tour selector that matches the marked element', () => {
    document.body.innerHTML = `<button data-tour="${VIRTUAL_MAP_TOUR_TARGETS.menuToggle}"></button>`

    expect(document.querySelector(getTourTargetSelector(VIRTUAL_MAP_TOUR_TARGETS.menuToggle))).not.toBeNull()
    expect(document.querySelector(getTourTargetSelector(VIRTUAL_MAP_TOUR_TARGETS.canvas))).toBeNull()
  })

  it('centers the first and last steps instead of pointing at an element', () => {
    expect(VIRTUAL_MAP_TOUR_STEP_TARGETS.welcome).toBeNull()
    expect(VIRTUAL_MAP_TOUR_STEP_TARGETS.finish).toBeNull()
  })
})

describe('virtual map tour spotlight', () => {
  const viewport = { width: 1280, height: 720 }

  it('pads the target rect on every side', () => {
    expect(getTourSpotlight({ top: 0, left: 570, width: 140, height: 56 }, viewport, 8)).toEqual({
      top: -8,
      left: 562,
      width: 156,
      height: 72,
    })
  })

  it('returns no spotlight without a target or for a target that fills the viewport', () => {
    expect(getTourSpotlight(null, viewport, 8)).toBeNull()
    expect(getTourSpotlight({ top: 0, left: 0, width: 1280, height: 720 }, viewport, 8)).toBeNull()
  })

  it('dims the whole viewport when there is no spotlight', () => {
    expect(getTourMaskPath(viewport, null, 16)).toBe('M0 0H1280V720H0Z')
  })

  it('cuts a rounded hole for the spotlight, shrinking the radius to fit small rects', () => {
    const path = getTourMaskPath(viewport, { top: 10, left: 20, width: 100, height: 20 }, 16)

    expect(path.startsWith('M0 0H1280V720H0Z')).toBe(true)
    expect(path).toContain('M30 10H110A10 10 0 0 1 120 20')
    expect(path.endsWith('Z')).toBe(true)
  })
})
