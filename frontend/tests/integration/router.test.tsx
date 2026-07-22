import { MantineProvider } from '@mantine/core'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AuthenticationContext } from '@/contexts/authentication-context'
import { Router } from '@/router'
import { createAuthenticationContextValue } from '../mocks/authentication'
import { createUserRecord } from '../mocks/pocketbase'

function renderRouter(
  authentication = createAuthenticationContextValue(),
) {
  render(
    <MantineProvider>
      <AuthenticationContext.Provider value={authentication}>
        <Router />
      </AuthenticationContext.Provider>
    </MantineProvider>,
  )
}

describe('Router', () => {
  it('redirects unauthenticated users from the administrator page to login', async () => {
    const user = userEvent.setup()
    const authentication = createAuthenticationContextValue()
    window.history.pushState({}, '', '/')

    renderRouter(authentication)

    await user.click(screen.getByRole('link', { name: 'Admin' }))

    expect(
      await screen.findByRole('heading', { name: 'UTFPR Virtual' }),
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe('/login')
  })

  it.each([
    ['editor', false],
    ['administrator', true],
  ])('allows an authenticated %s to access the protected area', (_, isAdmin) => {
    const user = createUserRecord({ is_admin: isAdmin })
    const authentication = createAuthenticationContextValue({
      isAuthenticated: true,
      token: 'valid-token',
      user,
    })
    window.history.pushState({}, '', '/admin')

    renderRouter(authentication)

    expect(screen.getByText('Admin Home')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/admin')
  })

  it('redirects an authenticated user away from login', () => {
    const authentication = createAuthenticationContextValue({
      isAuthenticated: true,
      token: 'valid-token',
      user: createUserRecord(),
    })
    window.history.pushState({}, '', '/login')

    renderRouter(authentication)

    expect(screen.getByText('Admin Home')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/admin')
  })

  it('restores the original destination after authentication', () => {
    const authentication = createAuthenticationContextValue({
      isAuthenticated: true,
      token: 'valid-token',
      user: createUserRecord(),
    })
    window.history.pushState(
      { usr: { from: { pathname: '/home' } } },
      '',
      '/login',
    )

    renderRouter(authentication)

    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/home')
  })
})
