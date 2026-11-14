import { MantineProvider } from '@mantine/core'
import { QuestionIcon } from '@phosphor-icons/react/dist/csr/Question'
import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

import VirtualMapToolbar from '@/components/virtual-map/virtual-map-toolbar/VirtualMapToolbar.tsx'
import VirtualMapToolbarButton from '@/components/virtual-map/virtual-map-toolbar/VirtualMapToolbarButton.tsx'
import VirtualMapTopLeftToolbar from '@/components/virtual-map/virtual-map-toolbar/VirtualMapTopLeftToolbar.tsx'
import messages from '@/constants/messages.json'
import { restartTour } from '@/helpers/virtual-map-tour-helper.ts'
import type { VirtualMapToolbarPosition } from '@/types/virtual-map-toolbar.ts'

jest.mock('@/helpers/virtual-map-tour-helper.ts', () => ({
  restartTour: jest.fn(),
}))

function renderWithMantine(ui: ReactNode) {
  return render(<MantineProvider>{ui}</MantineProvider>)
}

function getToolbarPanel() {
  const toolbar = screen.getByRole('toolbar', { name: messages.virtualMap.toolbar.ariaLabel })
  return toolbar.parentElement as HTMLElement
}

describe('VirtualMapToolbar', () => {
  it('renders every button inside a labelled vertical toolbar', () => {
    renderWithMantine(
      <VirtualMapToolbar position="top-left">
        <button type="button">Settings</button>
        <button type="button">Info</button>
        <button type="button">Help</button>
      </VirtualMapToolbar>,
    )

    const toolbar = screen.getByRole('toolbar', { name: messages.virtualMap.toolbar.ariaLabel })
    expect(toolbar).toHaveAttribute('aria-orientation', 'vertical')
    expect(screen.getAllByRole('button')).toHaveLength(3)
  })

  it('puts a divider between buttons', () => {
    const { container } = renderWithMantine(
      <VirtualMapToolbar position="top-left">
        <button type="button">Settings</button>
        <button type="button">Info</button>
        <button type="button">Help</button>
      </VirtualMapToolbar>,
    )

    expect(container.querySelectorAll('.mantine-Divider-root')).toHaveLength(2)
  })

  it('renders no divider around a single button', () => {
    const { container } = renderWithMantine(
      <VirtualMapToolbar position="top-left">
        <button type="button">Help</button>
      </VirtualMapToolbar>,
    )

    expect(container.querySelectorAll('.mantine-Divider-root')).toHaveLength(0)
  })

  it.each<[VirtualMapToolbarPosition, string[], string[]]>([
    ['top-left', ['top', 'left'], ['bottom', 'right']],
    ['top-right', ['top', 'right'], ['bottom', 'left']],
    ['bottom-left', ['bottom', 'left'], ['top', 'right']],
    ['bottom-right', ['bottom', 'right'], ['top', 'left']],
  ])('anchors the %s toolbar to that corner', (position, setSides, unsetSides) => {
    renderWithMantine(
      <VirtualMapToolbar position={position}>
        <button type="button">Help</button>
      </VirtualMapToolbar>,
    )

    const { style } = getToolbarPanel()
    setSides.forEach((side) => expect(style.getPropertyValue(side)).not.toBe(''))
    unsetSides.forEach((side) => expect(style.getPropertyValue(side)).toBe(''))
  })
})

describe('VirtualMapToolbarButton', () => {
  it('uses its label as the accessible name and runs its action on click', () => {
    const onClick = jest.fn()
    renderWithMantine(<VirtualMapToolbarButton icon={QuestionIcon} label="Help" onClick={onClick} />)

    fireEvent.click(screen.getByRole('button', { name: 'Help' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('VirtualMapTopLeftToolbar', () => {
  it('restarts the tour from its help button', () => {
    renderWithMantine(<VirtualMapTopLeftToolbar />)

    fireEvent.click(screen.getByRole('button', { name: messages.virtualMap.tour.restartLabel }))

    expect(restartTour).toHaveBeenCalledTimes(1)
  })
})
