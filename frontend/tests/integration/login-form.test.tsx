import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import LoginForm from '@/components/login-form'
import { AuthenticationContext } from '@/contexts/authentication-context'
import type { AuthenticationContextValue } from '@/types/authentication'
import { createAuthenticationContextValue } from '../mocks/authentication'

function renderLoginForm(
  authenticate = jest.fn<
      ReturnType<AuthenticationContextValue['authenticate']>,
      Parameters<AuthenticationContextValue['authenticate']>
  >(),
) {
  const authentication = createAuthenticationContextValue({ authenticate })

  render(
    <MantineProvider>
      <Notifications />
      <AuthenticationContext.Provider value={authentication}>
        <LoginForm />
      </AuthenticationContext.Provider>
    </MantineProvider>,
  )

  return { authenticate }
}

describe('LoginForm', () => {
  it('validates required fields and email formatting', async () => {
    const user = userEvent.setup()
    const { authenticate } = renderLoginForm()

    await user.click(screen.getByRole('button', { name: 'ENTRAR' }))

    expect(screen.getByText('Informe seu e-mail')).toBeInTheDocument()
    expect(screen.getByText('Informe sua senha')).toBeInTheDocument()
    expect(authenticate).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText('E-MAIL'), 'invalid-email')
    await user.type(screen.getByLabelText('SENHA'), 'password')
    await user.click(screen.getByRole('button', { name: 'ENTRAR' }))

    expect(screen.getByText('Informe um e-mail válido')).toBeInTheDocument()
    expect(authenticate).not.toHaveBeenCalled()
  })

  it('submits valid credentials to the authentication context', async () => {
    const user = userEvent.setup()
    const authenticate =
        jest.fn<
            ReturnType<AuthenticationContextValue['authenticate']>,
            Parameters<AuthenticationContextValue['authenticate']>
        >()
    authenticate.mockResolvedValue(null as never)
    renderLoginForm(authenticate)

    await user.type(screen.getByLabelText('E-MAIL'), 'editor@example.com')
    await user.type(screen.getByLabelText('SENHA'), 'password')
    await user.click(screen.getByRole('button', { name: 'ENTRAR' }))

    await waitFor(() => {
      expect(authenticate).toHaveBeenCalledWith(
        'editor@example.com',
        'password',
      )
    })
  })

  it('shows an error when authentication fails', async () => {
    const user = userEvent.setup()
    const authenticate =
        jest.fn<
            ReturnType<AuthenticationContextValue['authenticate']>,
            Parameters<AuthenticationContextValue['authenticate']>
        >()
    authenticate.mockRejectedValue(new Error('Invalid credentials'))
    renderLoginForm(authenticate)

    await user.type(screen.getByLabelText('E-MAIL'), 'editor@example.com')
    await user.type(screen.getByLabelText('SENHA'), 'incorrect-password')
    await user.click(screen.getByRole('button', { name: 'ENTRAR' }))

    expect(await screen.findByText('Não foi possível entrar')).toBeVisible()
    expect(screen.getByText('E-mail ou senha inválidos')).toBeVisible()
    expect(screen.getByLabelText('SENHA')).toHaveValue('')
    expect(screen.getByLabelText('E-MAIL')).toHaveValue('editor@example.com')
  })

  it('disables the form while authentication is pending', async () => {
    const user = userEvent.setup()
    const authenticate =
        jest.fn<
            ReturnType<AuthenticationContextValue['authenticate']>,
            Parameters<AuthenticationContextValue['authenticate']>
        >()
    authenticate.mockImplementation(() => new Promise<never>(() => undefined))
    renderLoginForm(authenticate)

    const emailInput = screen.getByLabelText('E-MAIL')
    const passwordInput = screen.getByLabelText('SENHA')
    const submitButton = screen.getByRole('button', { name: 'ENTRAR' })

    await user.type(emailInput, 'editor@example.com')
    await user.type(passwordInput, 'password')
    await user.click(submitButton)

    await waitFor(() => expect(authenticate).toHaveBeenCalled())
    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
    expect(submitButton).toBeDisabled()
  })
})
