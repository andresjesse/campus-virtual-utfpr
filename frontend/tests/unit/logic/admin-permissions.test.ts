import {
  canAccessAdminCapability,
  getAdminCapabilities,
} from '@/helpers/authorization/admin-permissions.ts'
import { createUserRecord } from '../../mocks/pocketbase.ts'

describe('admin permissions', () => {
  it('limits editors to pages and menu management', () => {
    const editor = createUserRecord({ is_admin: false })

    expect(getAdminCapabilities(editor)).toEqual([
      'pages.manage',
      'menu.manage',
    ])
    expect(canAccessAdminCapability(editor, 'entities.manage')).toBe(false)
    expect(canAccessAdminCapability(editor, 'meshes.manage')).toBe(false)
  })

  it('allows administrators to access every administration capability', () => {
    const administrator = createUserRecord({ is_admin: true })

    expect(canAccessAdminCapability(administrator, 'pages.manage')).toBe(true)
    expect(canAccessAdminCapability(administrator, 'menu.manage')).toBe(true)
    expect(canAccessAdminCapability(administrator, 'entities.manage')).toBe(true)
    expect(canAccessAdminCapability(administrator, 'meshes.manage')).toBe(true)
  })
})
