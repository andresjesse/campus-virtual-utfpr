import {
  VIRTUAL_MAP_TOUR_STEP_TARGETS,
  VIRTUAL_MAP_TOUR_STORAGE_KEY,
  VIRTUAL_MAP_TOUR_TARGETS,
} from '@/constants/virtual-map-tour-constants.ts'
import {
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
