import { MantineProvider } from '@mantine/core'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import messages from '@/constants/messages.json'
import Home from '@/pages/home'

jest.mock('@/components/virtual-map/virtual-map-viewer/VirtualMapViewer.tsx', () => ({
  __esModule: true,
  default: () => <div data-testid="virtual-map-viewer" />,
}))

describe('Home', () => {
  it('renders the virtual map with the administrator navigation link', () => {
    render(
      <MantineProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </MantineProvider>,
    )

    expect(screen.getByTestId('virtual-map-viewer')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: messages.virtualMap.home.adminLink }),
    ).toHaveAttribute('href', '/admin')
  })
})
