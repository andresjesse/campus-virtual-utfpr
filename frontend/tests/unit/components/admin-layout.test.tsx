import { MantineProvider } from '@mantine/core'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'

import { getStorageKey } from '@/config/branding'
import messages from '@/constants/messages.json'
import { AuthenticationContext } from '@/contexts/authentication-context'
import AdminLayout from '@/layouts/admin'
import { createAuthenticationContextValue } from '@/mocks/authentication.ts'
import { createUserRecord } from '@/mocks/pocketbase.ts'

jest.mock('@/services/pocketbase', () => ({
  pocketbase: { files: { getURL: jest.fn(() => '') } },
}))

const SIDEBAR_STORAGE_KEY = getStorageKey('admin-sidebar-collapsed')

function mockViewport(isDesktop: boolean) {
  jest.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: isDesktop && query.includes('min-width'),
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }) as MediaQueryList,
  )
}

function renderAdminLayout() {
  render(
    <MantineProvider>
      <AuthenticationContext.Provider
        value={createAuthenticationContextValue({
          isAuthenticated: true,
          token: 'valid-token',
          user: createUserRecord(),
        })}
      >
        <MemoryRouter initialEntries={['/admin/pages']}>
          <Routes>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="pages" element={<p>Pages content</p>} />
              <Route path="menu" element={<p>Menu content</p>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthenticationContext.Provider>
    </MantineProvider>,
  )
}

describe('AdminLayout', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('shows full navigation labels on a phone even when the desktop sidebar is collapsed', () => {
    mockViewport(false)
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, 'true')

    renderAdminLayout()

    expect(
      screen.getByRole('link', { name: messages.adminNavigation.pages }),
    ).not.toHaveAttribute('title')
  })

  it('collapses the navigation on a desktop when the sidebar is stored collapsed', () => {
    mockViewport(true)
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, 'true')

    renderAdminLayout()

    expect(
      screen.getByRole('link', { name: messages.adminNavigation.pages }),
    ).toHaveAttribute('title', messages.adminNavigation.pages)
  })

  it('switches the burger label between opening and closing the navigation', () => {
    mockViewport(false)
    renderAdminLayout()

    fireEvent.click(
      screen.getByRole('button', { name: messages.adminLayout.openNavigationLabel }),
    )

    expect(
      screen.getByRole('button', { name: messages.adminLayout.closeNavigationLabel }),
    ).toBeInTheDocument()
  })

  it('closes the navigation drawer after a link is tapped', () => {
    mockViewport(false)
    renderAdminLayout()

    fireEvent.click(
      screen.getByRole('button', { name: messages.adminLayout.openNavigationLabel }),
    )
    fireEvent.click(screen.getByRole('link', { name: messages.adminNavigation.menu }))

    expect(screen.getByText('Menu content')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: messages.adminLayout.openNavigationLabel }),
    ).toBeInTheDocument()
  })

  it('still renders when the sidebar setting cannot be read', () => {
    mockViewport(true)
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled')
    })
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage disabled')
    })

    renderAdminLayout()

    expect(screen.getByText('Pages content')).toBeInTheDocument()
  })
})
