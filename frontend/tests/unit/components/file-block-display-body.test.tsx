import { render } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'

import FileBlockDisplayBody from '@/components/content-input/content-blocks/file-block/FileBlockDisplayBody.tsx'

function renderBody(urls: string[]) {
  return render(
    <MantineProvider>
      <FileBlockDisplayBody
        isLoading={false}
        content={{ newFiles: [], deletedUrls: [], urls }}
      />
    </MantineProvider>,
  )
}

describe('FileBlockDisplayBody', () => {
  it('renders a video with controls for a video URL', () => {
    renderBody(['http://localhost/api/files/c/r/clip.mp4'])

    const video = document.querySelector('video')
    expect(video).toBeInTheDocument()
    expect(video).toHaveAttribute('controls')
    expect(video).toHaveAttribute('preload', 'metadata')
    expect(document.querySelector('img')).not.toBeInTheDocument()
  })

  it('keeps rendering images as cards', () => {
    renderBody(['http://localhost/api/files/c/r/photo.png'])

    expect(document.querySelector('video')).not.toBeInTheDocument()
    expect(document.querySelectorAll('img')).toHaveLength(1)
  })

  it('renders videos and images side by side in the same block', () => {
    renderBody([
      'http://localhost/api/files/c/r/photo.png',
      'http://localhost/api/files/c/r/clip.mp4',
    ])

    expect(document.querySelectorAll('video')).toHaveLength(1)
    expect(document.querySelectorAll('img')).toHaveLength(1)
  })
})
