import { bytesToMegabytes, formatFileSize } from '@/helpers/conversion-helper.ts'

describe('conversion-helper', () => {
  describe('bytesToMegabytes', () => {
    it('converts bytes to decimal megabytes', () => {
      expect(bytesToMegabytes(1000 * 1000 * 15)).toBe(15)
      expect(bytesToMegabytes(1_500_000)).toBe(1.5)
    })
  })

  describe('formatFileSize', () => {
    it('formats with one decimal place and the MB suffix', () => {
      expect(formatFileSize(2_500_000)).toBe('2.5MB')
      expect(formatFileSize(1000 * 1000 * 50)).toBe('50.0MB')
      expect(formatFileSize(0)).toBe('0.0MB')
    })
  })
})
