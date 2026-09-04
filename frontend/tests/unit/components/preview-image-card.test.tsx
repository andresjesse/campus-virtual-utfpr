import { fireEvent, render } from '@testing-library/react'

import { MantineProvider } from '@mantine/core'

import PreviewImageCard from '@/components/content-input/content-blocks/overlay/file-block/PreviewImageCard.tsx'

const src = 'http://localhost/api/files/c/r/image.png'

function renderCard({ marked = false, onToggle = jest.fn(), interactive = true } = {}) {
  const { container: root } = render(
    <MantineProvider>
      <PreviewImageCard
        src={src}
        marked={marked}
        onToggle={onToggle}
        interactive={interactive}
      />
    </MantineProvider>,
  )
  const img = root.querySelector('img')!
  return { container: img.parentElement!, onToggle }
}

describe('PreviewImageCard', () => {
  it('toggles the marked state when clicked', () => {
    const { container, onToggle } = renderCard()

    fireEvent.click(container)

    expect(onToggle).toHaveBeenCalledWith(src)
  })

  it('lifts the image on hover as a depth effect', () => {
    const { container } = renderCard()

    fireEvent.mouseEnter(container)
    expect(container.style.transform).toBe('translateY(-3px) scale(1.03)')
    expect(container.style.boxShadow).not.toBe('none')

    fireEvent.mouseLeave(container)
    expect(container.style.transform).toBe('translateY(0) scale(1)')
    expect(container.style.boxShadow).toBe('none')
  })

  it('visually separates marked images from the others', () => {
    const unmarked = renderCard()
    const marked = renderCard({ marked: true })

    expect(unmarked.container.style.border).toContain('transparent')
    expect(marked.container.style.border).not.toContain('transparent')
  })
})