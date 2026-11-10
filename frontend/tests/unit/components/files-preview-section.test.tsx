import { fireEvent, render, screen } from '@testing-library/react'

import { MantineProvider } from '@mantine/core'

import FilesPreviewSection from '@/components/content-input/content-blocks/overlay/file-block/FilesPreviewSection.tsx'

const urls = Array.from(
  { length: 5 },
  (_, index) => `http://localhost/api/files/c/r/image-${index}.png`,
)

function renderSection({
  content = urls,
  onToggleDelete = jest.fn(),
}: {
  content?: string[]
  onToggleDelete?: jest.Mock
} = {}) {
  render(
    <MantineProvider>
      <FilesPreviewSection
        content={content}
        onToggleDelete={onToggleDelete}
        interactive={true}
      />
    </MantineProvider>,
  )
  return { onToggleDelete }
}

function imageCount() {
  return document.querySelectorAll('img').length
}

describe('FilesPreviewSection', () => {
  it('renders all images when they fit in two rows', () => {
    renderSection({ content: urls.slice(0, 2) })

    expect(imageCount()).toBe(2)
    expect(screen.queryByRole('button', { name: /ver mais/i })).not.toBeInTheDocument()
  })

  it('collapses to two rows and expands on demand', () => {
    renderSection()

    expect(imageCount()).toBe(2)
    expect(screen.queryByRole('button', { name: /ver mais/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /ver mais/i }))
    expect(imageCount()).toBe(5)
    expect(screen.queryByRole('button', { name: /ver menos/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /ver menos/i }))
    expect(imageCount()).toBe(2)
  })

  it('forwards toggle clicks for visible images', () => {
    const { onToggleDelete } = renderSection()

    const visibleUrl = urls[0]
    fireEvent.click(
      screen
        .getAllByRole('button')
        .find((button) => button.textContent === '')!,
    )

    expect(onToggleDelete).toHaveBeenCalledWith(visibleUrl)
  })
})