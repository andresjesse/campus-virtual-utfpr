import { isVideoUrl } from '@/helpers/file-helper.ts'

describe('isVideoUrl', () => {
  it('accepts .mp4 files', () => {
    expect(isVideoUrl('http://localhost/api/files/c/r/clip.mp4')).toBe(true)
  })

  it('ignores the extension case', () => {
    expect(isVideoUrl('http://localhost/api/files/c/r/CLIP.MP4')).toBe(true)
  })

  it('ignores a query string', () => {
    expect(isVideoUrl('http://localhost/api/files/c/r/clip.mp4?token=abc')).toBe(true)
  })

  it.each(['png', 'jpg', 'pdf'])('rejects .%s files', (extension) => {
    expect(isVideoUrl(`http://localhost/api/files/c/r/file.${extension}`)).toBe(false)
  })

  it('rejects a value that is not a URL', () => {
    expect(isVideoUrl('not-a-url')).toBe(false)
  })
})
