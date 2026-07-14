import { MantineProvider } from '@mantine/core'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Router } from '@/router'

describe('Router', () => {
  it('navigates from home to the administrator page', async () => {
    const user = userEvent.setup()
    window.history.pushState({}, '', '/')

    render(
      <MantineProvider>
        <Router />
      </MantineProvider>,
    )

    await user.click(screen.getByRole('link', { name: 'Admin' }))

    expect(window.location.pathname).toBe('/admin')
  })
})
