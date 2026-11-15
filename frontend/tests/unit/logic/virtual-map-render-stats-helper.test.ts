import { createFrameRateSampler } from '@/helpers/virtual-map-render-stats-helper.ts'

describe('createFrameRateSampler', () => {
  it('reports nothing until a whole sample window has passed', () => {
    const sample = createFrameRateSampler(500)

    expect(sample(0)).toBeNull()
    expect(sample(100)).toBeNull()
    expect(sample(499)).toBeNull()
  })

  it('reports the frames per second of the window that just ended', () => {
    const sample = createFrameRateSampler(500)
    sample(0)

    for (let time = 16; time < 500; time += 16) sample(time)

    expect(sample(500)).toBe(Math.round((32 * 1000) / 500))
  })

  it('starts a new window after each report', () => {
    const sample = createFrameRateSampler(1000)
    sample(0)
    expect(sample(1000)).toBe(1)

    expect(sample(1500)).toBeNull()
    expect(sample(2000)).toBe(2)
  })

  it('accounts for a window that runs longer than the sample time', () => {
    const sample = createFrameRateSampler(500)
    sample(0)

    expect(sample(2000)).toBe(1)
  })
})
