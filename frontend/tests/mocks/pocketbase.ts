import type PocketBase from 'pocketbase'

import type { UserRecord } from '@/types/authentication'

type PocketBaseMockOptions = {
  authenticatedUser?: UserRecord
  initialUser?: UserRecord | null
  refreshError?: Error
  token?: string
}

export function createUserRecord(
  overrides: Partial<UserRecord> = {},
): UserRecord {
  return {
    avatar: '',
    collectionId: 'users-collection',
    collectionName: 'users',
    created: '2026-01-01T00:00:00.000Z',
    department: 'ASCOM',
    email: 'editor@example.com',
    emailVisibility: true,
    expand: {},
    id: 'user-id',
    is_admin: false,
    name: 'Editor',
    surname: 'User',
    updated: '2026-01-01T00:00:00.000Z',
    verified: true,
    ...overrides,
  }
}

export function createPocketBaseMock({
  authenticatedUser = createUserRecord(),
  initialUser = null,
  refreshError,
  token: initialToken = 'stored-token',
}: PocketBaseMockOptions = {}) {
  let currentUser = initialUser
  let currentToken = initialUser ? initialToken : ''
  let isValid = Boolean(initialUser)
  const listeners = new Set<() => void>()

  function notifyListeners() {
    listeners.forEach((listener) => listener())
  }

  const clear = jest.fn(() => {
    currentUser = null
    currentToken = ''
    isValid = false
    notifyListeners()
  })

  const authRefresh = jest.fn(async () => {
    if (refreshError) {
      throw refreshError
    }

    return { record: currentUser, token: currentToken }
  })

  const authWithPassword = jest.fn(async () => {
    currentUser = authenticatedUser
    currentToken = 'authenticated-token'
    isValid = true
    notifyListeners()

    return { record: currentUser, token: currentToken }
  })

  const authStore = {
    get isValid() {
      return isValid
    },
    get record() {
      return currentUser
    },
    get token() {
      return currentToken
    },
    clear,
    onChange(callback: () => void) {
      listeners.add(callback)
      return () => listeners.delete(callback)
    },
  }

  const collection = jest.fn(() => ({
    authRefresh,
    authWithPassword,
  }))

  return {
    authRefresh,
    authWithPassword,
    clear,
    client: { authStore, collection } as unknown as PocketBase,
  }
}
