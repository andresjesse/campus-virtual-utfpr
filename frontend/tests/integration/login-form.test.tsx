import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import LoginForm from '@/components/login-form'
import messages from '@/constants/messages.json'
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

    await user.click(screen.getByRole('button', { name: messages.login.form.submit }))

    expect(screen.getByText(messages.login.validation.emailRequired)).toBeInTheDocument()
    expect(screen.getByText(messages.login.validation.passwordRequired)).toBeInTheDocument()
    expect(authenticate).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText(messages.login.form.emailLabel), 'invalid-email')
    await user.type(screen.getByLabelText(messages.login.form.passwordLabel), 'password')
    await user.click(screen.getByRole('button', { name: messages.login.form.submit }))

    expect(screen.getByText(messages.login.validation.emailInvalid)).toBeInTheDocument()
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

    await user.type(screen.getByLabelText(messages.login.form.emailLabel), 'editor@example.com')
    await user.type(screen.getByLabelText(messages.login.form.passwordLabel), 'password')
    await user.click(screen.getByRole('button', { name: messages.login.form.submit }))

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

    await user.type(screen.getByLabelText(messages.login.form.emailLabel), 'editor@example.com')
    await user.type(screen.getByLabelText(messages.login.form.passwordLabel), 'incorrect-password')
    await user.click(screen.getByRole('button', { name: messages.login.form.submit }))

    expect(await screen.findByText(messages.login.authentication.failedTitle)).toBeVisible()
    expect(screen.getByText(messages.login.authentication.invalidCredentials)).toBeVisible()
    expect(screen.getByLabelText(messages.login.form.passwordLabel)).toHaveValue('')
    expect(screen.getByLabelText(messages.login.form.emailLabel)).toHaveValue('editor@example.com')
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

    const emailInput = screen.getByLabelText(messages.login.form.emailLabel)
    const passwordInput = screen.getByLabelText(messages.login.form.passwordLabel)
    const submitButton = screen.getByRole('button', { name: messages.login.form.submit })

    await user.type(emailInput, 'editor@example.com')
    await user.type(passwordInput, 'password')
    await user.click(submitButton)

    await waitFor(() => expect(authenticate).toHaveBeenCalled())
    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
    expect(submitButton).toBeDisabled()
  })
})
