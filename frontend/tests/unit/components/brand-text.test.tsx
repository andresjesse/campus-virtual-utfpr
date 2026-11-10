import { MantineProvider } from '@mantine/core'
import { render, screen } from '@testing-library/react'

import BrandText from '@/components/brand-text/BrandText.tsx'
import { branding } from '@/config/branding.ts'

describe('BrandText', () => {
  it('renders the parts in order separated by spaces', () => {
    const { container } = render(
      <MantineProvider>
        <BrandText parts={[{ text: 'North' }, { text: 'Riverside', highlighted: true }, { text: 'Unit' }]} />
      </MantineProvider>,
    )

    expect(container).toHaveTextContent('North Riverside Unit')
  })

  it('colors only the highlighted parts with the brand color', () => {
    render(
      <MantineProvider>
        <BrandText parts={[{ text: 'Unit' }, { text: 'Riverside', highlighted: true }]} />
      </MantineProvider>,
    )

    expect(screen.getByText('Riverside')).toHaveStyle({ color: branding.colors.brand.primary })
    expect(screen.getByText('Unit')).not.toHaveStyle({ color: branding.colors.brand.primary })
  })
})
