import type { AuthenticationContextValue } from '@/types/authentication'

export function createAuthenticationContextValue(
  overrides: Partial<AuthenticationContextValue> = {},
): AuthenticationContextValue {
  return {
    authenticate: jest.fn(async () => null as never),
    isAuthenticated: false,
    isInitializing: false,
    logout: jest.fn(),
    token: '',
    user: null,
    ...overrides,
  }
}
