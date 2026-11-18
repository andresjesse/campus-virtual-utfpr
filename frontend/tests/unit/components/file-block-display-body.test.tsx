import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'

import FileBlockDisplayBody from '@/components/content-input/content-blocks/file-block/FileBlockDisplayBody.tsx'
import messages from '@/constants/messages.json'

function renderBodies(...blocks: string[][]) {
  return render(
    <MantineProvider>
      {blocks.map((urls, index) => (
        <FileBlockDisplayBody
          key={index}
          isLoading={false}
          content={{ newFiles: [], deletedUrls: [], urls }}
        />
      ))}
    </MantineProvider>,
  )
}

const image = (name: string) => `http://localhost/api/files/c/r/${name}.png`
const video = (name: string) => `http://localhost/api/files/c/r/${name}.mp4`

describe('FileBlockDisplayBody', () => {
  it('renders a single video with controls and no carousel controls', () => {
    renderBodies([video('clip')])

    const element = document.querySelector('video')
    expect(element).toBeInTheDocument()
    expect(element).toHaveAttribute('controls')
    expect(element).toHaveAttribute('preload', 'metadata')
    expect(screen.queryByLabelText(messages.files.carousel.next)).not.toBeInTheDocument()
  })

  it('renders a single image without carousel controls', () => {
    renderBodies([image('photo')])

    expect(document.querySelectorAll('img')).toHaveLength(1)
    expect(screen.queryByLabelText(messages.files.carousel.next)).not.toBeInTheDocument()
  })

  it('renders one slide per file with carousel controls', () => {
    renderBodies([image('a'), image('b'), image('c')])

    expect(document.querySelectorAll('img')).toHaveLength(3)
    expect(screen.getByLabelText(messages.files.carousel.previous)).toBeInTheDocument()
    expect(screen.getByLabelText(messages.files.carousel.next)).toBeInTheDocument()
  })

  it('keeps images and videos in the stored order', () => {
    renderBodies([image('first'), video('second'), image('third')])

    const media = Array.from(document.querySelectorAll('img, video')).map((node) =>
      node.tagName.toLowerCase(),
    )
    expect(media).toEqual(['img', 'video', 'img'])
  })

  it('renders an independent carousel for each block', () => {
    renderBodies([image('a'), image('b')], [image('c'), image('d')])

    expect(screen.getAllByLabelText(messages.files.carousel.next)).toHaveLength(2)
  })
})
