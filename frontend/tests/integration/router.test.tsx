import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { render, screen } from '@testing-library/react'

import messages from '@/constants/messages.json'
import { AuthenticationContext } from '@/contexts/authentication-context'
import { Router } from '@/router'
import { createAuthenticationContextValue } from '../mocks/authentication'
import { createUserRecord } from '../mocks/pocketbase'

jest.mock('@/services/content-page-service.ts', () => ({
  getContentPageErrorMessage: () => 'Request failed',
  listContentPages: jest.fn(async () => []),
}))

jest.mock('@/services/entity-service.ts', () => ({
  listEntities: jest.fn(async () => []),
  deleteEntity: jest.fn(),
  getEntity: jest.fn(),
  createEntity: jest.fn(),
  updateEntity: jest.fn(),
}))

jest.mock('@/services/mesh-service.ts', () => ({
  listMeshes: jest.fn(async () => []),
}))

jest.mock('@/services/menu-item-service.ts', () => ({
  listMenuItems: jest.fn(async () => []),
  deleteMenuItem: jest.fn(),
  getMenuItem: jest.fn(),
  createMenuItem: jest.fn(),
  updateMenuItem: jest.fn(),
  listMenuItemPages: jest.fn(async () => []),
  getMenuItemIconUrl: jest.fn(() => ''),
}))

jest.mock('@/services/menu-category-service.ts', () => ({
  listMenuCategories: jest.fn(async () => []),
  deleteMenuCategory: jest.fn(),
  getMenuCategory: jest.fn(),
  createMenuCategory: jest.fn(),
  updateMenuCategory: jest.fn(),
}))

jest.mock('@/services/pocketbase', () => ({
  pocketbase: { files: { getURL: jest.fn(() => '') } },
}))

function renderRouter(
  authentication = createAuthenticationContextValue(),
) {
  render(
    <MantineProvider>
      <Notifications />
      <AuthenticationContext.Provider value={authentication}>
        <Router />
      </AuthenticationContext.Provider>
    </MantineProvider>,
  )
}

function authenticatedUser(isAdmin = false) {
  return createAuthenticationContextValue({
    isAuthenticated: true,
    token: 'valid-token',
    user: createUserRecord({ is_admin: isAdmin }),
  })
}

describe('Router', () => {
  it('redirects unauthenticated users from the administrator page to login', async () => {
    window.history.pushState({}, '', '/admin')

    renderRouter()

    expect(
      await screen.findByRole('heading', { name: 'UTFPR Virtual' }),
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe('/login')
  })

  it.each([
    ['editor', false],
    ['administrator', true],
  ])('redirects an authenticated %s to content pages', async (_, isAdmin) => {
    window.history.pushState({}, '', '/admin')

    renderRouter(authenticatedUser(isAdmin))

    expect(
      await screen.findByText(messages.contentPages.list.emptyTitle),
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe('/admin/pages')
  })

  it('hides administrator-only navigation and rejects a direct editor URL', async () => {
    window.history.pushState({}, '', '/admin/entities')

    renderRouter(authenticatedUser(false))

    expect(
      await screen.findByText(messages.contentPages.list.emptyTitle),
    ).toBeInTheDocument()
    expect(screen.queryByText(messages.entities.list.title)).not.toBeInTheDocument()
    expect(screen.queryByText(messages.mesh.list.title)).not.toBeInTheDocument()
    expect(window.location.pathname).toBe('/admin/pages')
  })

  it('allows an administrator to access the entity list', async () => {
    window.history.pushState({}, '', '/admin/entities')

    renderRouter(authenticatedUser(true))

    expect(
      await screen.findByRole('heading', {
        name: messages.entities.list.emptyTitle,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText(messages.entities.list.searchLabel),
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe('/admin/entities')
  })

  it('allows an administrator to open the entity editor', async () => {
    window.history.pushState({}, '', '/admin/entities/new')

    renderRouter(authenticatedUser(true))

    expect(
      await screen.findByLabelText(messages.entities.editor.newTitle),
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe('/admin/entities/new')
  })

  it('sends an editor from the menu section to the categories tab', async () => {
    window.history.pushState({}, '', '/admin/menu')

    renderRouter(authenticatedUser(false))

    expect(
      await screen.findByRole('tab', { name: messages.menu.tabs.categories }),
    ).toHaveAttribute('aria-selected', 'true')
    expect(window.location.pathname).toBe('/admin/menu/categories')
  })

  it('lets an editor open the menu items tab', async () => {
    window.history.pushState({}, '', '/admin/menu/items')

    renderRouter(authenticatedUser(false))

    expect(
      await screen.findByRole('tab', { name: messages.menu.tabs.items }),
    ).toHaveAttribute('aria-selected', 'true')
    expect(
      screen.getByText(messages.menuItems.list.emptyTitle),
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe('/admin/menu/items')
  })

  it('lets an editor open the menu item editor', async () => {
    window.history.pushState({}, '', '/admin/menu/items/new')

    renderRouter(authenticatedUser(false))

    expect(
      await screen.findByLabelText(messages.menuItems.editor.newTitle),
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe('/admin/menu/items/new')
  })

  it('lets an editor open the category editor', async () => {
    window.history.pushState({}, '', '/admin/menu/categories/new')

    renderRouter(authenticatedUser(false))

    expect(
      await screen.findByLabelText(messages.menuCategories.editor.newTitle),
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe('/admin/menu/categories/new')
  })

  it('redirects an authenticated user away from login', async () => {
    window.history.pushState({}, '', '/login')

    renderRouter(authenticatedUser())

    expect(
      await screen.findByText(messages.contentPages.list.emptyTitle),
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe('/admin/pages')
  })

  it('restores the original destination after authentication', async () => {
    window.history.pushState(
      { usr: { from: { pathname: '/admin/pages' } } },
      '',
      '/login',
    )

    renderRouter(authenticatedUser())

    expect(
      await screen.findByText(messages.contentPages.list.emptyTitle),
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe('/admin/pages')
  })
})
