import { MantineProvider } from '@mantine/core'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import messages from '@/constants/messages.json'
import Home from '@/pages/home'

const mockViewer = jest.fn()

jest.mock('@/components/virtual-map/virtual-map-viewer/VirtualMapViewer.tsx', () => ({
  __esModule: true,
  default: () => mockViewer(),
}))

function renderHome() {
  render(
    <MantineProvider>
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    </MantineProvider>,
  )
}

beforeEach(() => {
  mockViewer.mockImplementation(() => <div data-testid="virtual-map-viewer" />)
})

describe('Home', () => {
  it('lazy-loads the virtual map without an administrator link', async () => {
    renderHome()

    expect(await screen.findByTestId('virtual-map-viewer')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('keeps the page usable when the virtual map cannot be shown', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockViewer.mockImplementation(() => {
      throw new Error('WebGL unavailable')
    })

    renderHome()

    expect(
      await screen.findByText(messages.virtualMap.viewer.unavailableDescription),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: messages.common.retry })).toBeInTheDocument()
  })
})
