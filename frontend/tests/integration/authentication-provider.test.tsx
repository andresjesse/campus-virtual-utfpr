import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useAuthentication } from '@/hooks/use-authentication'
import { AuthenticationProvider } from '@/providers/authentication-provider'
import { createPocketBaseMock, createUserRecord } from '../mocks/pocketbase'

jest.mock('@/services/pocketbase', () => ({ pocketbase: {} }))

function AuthenticationProbe() {
  const authentication = useAuthentication()

  return (
    <>
      <span>{authentication.isInitializing ? 'initializing' : 'ready'}</span>
      <span>
        {authentication.isAuthenticated ? 'authenticated' : 'anonymous'}
      </span>
      <span>{authentication.user?.email ?? 'no-user'}</span>
      <button
        type="button"
        onClick={() => {
          void authentication.authenticate(' editor@example.com ', 'secret')
        }}
      >
        Log in
      </button>
      <button type="button" onClick={authentication.logout}>
        Log out
      </button>
    </>
  )
}

function renderAuthenticationProvider(
  pocketbaseClient: ReturnType<typeof createPocketBaseMock>['client'],
) {
  render(
    <AuthenticationProvider pocketbaseClient={pocketbaseClient}>
      <AuthenticationProbe />
    </AuthenticationProvider>,
  )
}

describe('AuthenticationProvider', () => {
  it('finishes initialization without a stored session', async () => {
    const pocketbase = createPocketBaseMock()

    renderAuthenticationProvider(pocketbase.client)

    expect(await screen.findByText('ready')).toBeInTheDocument()
    expect(screen.getByText('anonymous')).toBeInTheDocument()
    expect(pocketbase.authRefresh).not.toHaveBeenCalled()
  })

  it('restores a valid stored session', async () => {
    const editor = createUserRecord()
    const pocketbase = createPocketBaseMock({ initialUser: editor })

    renderAuthenticationProvider(pocketbase.client)

    expect(await screen.findByText('ready')).toBeInTheDocument()
    expect(screen.getByText('authenticated')).toBeInTheDocument()
    expect(screen.getByText(editor.email)).toBeInTheDocument()
    expect(pocketbase.authRefresh).toHaveBeenCalledTimes(1)
  })

  it('clears an invalid stored session', async () => {
    const pocketbase = createPocketBaseMock({
      initialUser: createUserRecord(),
      refreshError: new Error('Expired token'),
    })

    renderAuthenticationProvider(pocketbase.client)

    expect(await screen.findByText('ready')).toBeInTheDocument()
    expect(screen.getByText('anonymous')).toBeInTheDocument()
    expect(screen.getByText('no-user')).toBeInTheDocument()
    expect(pocketbase.clear).toHaveBeenCalledTimes(1)
  })

  it('authenticates with trimmed email credentials', async () => {
    const user = userEvent.setup()
    const pocketbase = createPocketBaseMock()

    renderAuthenticationProvider(pocketbase.client)
    await screen.findByText('ready')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    await waitFor(() => {
      expect(pocketbase.authWithPassword).toHaveBeenCalledWith(
        'editor@example.com',
        'secret',
      )
    })
    expect(screen.getByText('authenticated')).toBeInTheDocument()
  })

  it('clears the active session on logout', async () => {
    const user = userEvent.setup()
    const pocketbase = createPocketBaseMock({
      initialUser: createUserRecord(),
    })

    renderAuthenticationProvider(pocketbase.client)
    await screen.findByText('ready')
    await user.click(screen.getByRole('button', { name: 'Log out' }))

    expect(pocketbase.clear).toHaveBeenCalledTimes(1)
    expect(screen.getByText('anonymous')).toBeInTheDocument()
    expect(screen.getByText('no-user')).toBeInTheDocument()
  })
})
