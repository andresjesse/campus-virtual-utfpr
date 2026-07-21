import { MantineProvider } from '@mantine/core'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AuthenticationContext } from '@/contexts/authentication-context'
import { Router } from '@/router'
import { createAuthenticationContextValue } from '../mocks/authentication'

describe('Router', () => {
  it('redirects unauthenticated users from the administrator page to login', async () => {
    const user = userEvent.setup()
    const authentication = createAuthenticationContextValue()
    window.history.pushState({}, '', '/')

    render(
      <MantineProvider>
        <AuthenticationContext.Provider value={authentication}>
          <Router />
        </AuthenticationContext.Provider>
      </MantineProvider>,
    )

    await user.click(screen.getByRole('link', { name: 'Admin' }))

    expect(
      await screen.findByRole('heading', { name: 'UTFPR Virtual' }),
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe('/login')
  })
})
