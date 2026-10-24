import { buildMenuTree } from '@/helpers/menu-item-service-helper.ts'
import type { MenuItemRecord } from '@/types/menu.ts'

function createItem(overrides: Partial<MenuItemRecord>): MenuItemRecord {
  return {
    id: 'item',
    label: 'Item',
    icon: 'icon.svg',
    href: 'https://example.com',
    page: '',
    parent: '',
    category: 'main',
    expand: { category: { id: 'main', label: 'Main Menu' } },
    ...overrides,
  } as MenuItemRecord
}

describe('buildMenuTree', () => {
  it('returns no categories for an empty list', () => {
    expect(buildMenuTree([])).toEqual([])
  })

  it('groups root items by category keeping the input order', () => {
    const tree = buildMenuTree([
      createItem({ id: 'a', label: 'Admissions' }),
      createItem({ id: 'b', label: 'Library' }),
      createItem({
        id: 'c',
        label: 'Instagram',
        category: 'social',
        expand: { category: { id: 'social', label: 'Social Media' } },
      }),
    ] as MenuItemRecord[])

    expect(tree.map((category) => category.label)).toEqual(['Main Menu', 'Social Media'])
    expect(tree[0].items.map((node) => node.item.id)).toEqual(['a', 'b'])
    expect(tree[1].items.map((node) => node.item.id)).toEqual(['c'])
  })

  it('nests children under their parent at any depth', () => {
    const [category] = buildMenuTree([
      createItem({ id: 'child', parent: 'root' }),
      createItem({ id: 'grandchild', parent: 'child' }),
      createItem({ id: 'root' }),
    ])

    expect(category.items).toHaveLength(1)
    expect(category.items[0].item.id).toBe('root')
    expect(category.items[0].children[0].item.id).toBe('child')
    expect(category.items[0].children[0].children[0].item.id).toBe('grandchild')
  })

  it('treats an item whose parent is missing as a root item', () => {
    const [category] = buildMenuTree([createItem({ id: 'orphan', parent: 'gone' })])

    expect(category.items.map((node) => node.item.id)).toEqual(['orphan'])
  })
})
