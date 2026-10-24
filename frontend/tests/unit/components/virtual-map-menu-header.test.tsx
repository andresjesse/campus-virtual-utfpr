import { MantineProvider } from '@mantine/core'
import { render, screen } from '@testing-library/react'

import VirtualMapMenuHeader from '@/components/virtual-map/virtual-map-menu/VirtualMapMenuHeader.tsx'
import { auroraBrand } from '@/mocks/branding.ts'

function renderHeader(brand = auroraBrand()) {
  render(
    <MantineProvider>
      <VirtualMapMenuHeader brand={brand} />
    </MantineProvider>,
  )
}

describe('VirtualMapMenuHeader', () => {
  it('shows the brand title and the location', () => {
    renderHeader()

    expect(screen.getByText('Aurora')).toBeInTheDocument()
    expect(screen.getByText('Portal')).toBeInTheDocument()
    expect(screen.getByText('Riverside')).toBeInTheDocument()
  })

  it('omits the location when none is configured', () => {
    renderHeader({ ...auroraBrand(), location: [] })

    expect(screen.getByText('Aurora')).toBeInTheDocument()
    expect(screen.queryByText('Riverside')).not.toBeInTheDocument()
    expect(screen.queryByText('Unit')).not.toBeInTheDocument()
  })
})
