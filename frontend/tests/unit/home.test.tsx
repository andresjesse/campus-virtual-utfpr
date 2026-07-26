import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import Home from '@/pages/home'

describe('Home', () => {
  it('renders the administrator navigation link', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Admin' })).toHaveAttribute(
      'href',
      '/admin',
    )
  })
})
