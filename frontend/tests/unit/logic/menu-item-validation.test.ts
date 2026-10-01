import messages from '@/constants/messages.json'
import { formatMessage } from '@/helpers/message-helper.ts'
import {
  buildMenuItemPageOptions,
  getMenuItemHrefError,
  getMenuItemParentOptions,
  sortMenuItemsByCategory,
  toMenuItemFormValues,
  validateMenuItemForm,
} from '@/helpers/menu-item-service-helper.ts'
import type { ContentPageRecord } from '@/types/content-page.ts'
import type { MenuItemFormValues, MenuItemRecord } from '@/types/menu.ts'

function createMenuItem(overrides: Partial<MenuItemRecord> = {}): MenuItemRecord {
  return {
    collectionId: 'menu-items-collection',
    collectionName: 'menu_items',
    created: '2026-01-01T00:00:00.000Z',
    updated: '2026-01-01T00:00:00.000Z',
    id: 'item-id',
    label: 'Student Area',
    icon: 'icon.png',
    href: '',
    page: '',
    parent: '',
    category: 'general',
    ...overrides,
  } as MenuItemRecord
}

function createPage(overrides: Partial<ContentPageRecord> = {}): ContentPageRecord {
  return {
    collectionId: 'content-page-collection',
    collectionName: 'content_page',
    created: '2026-01-01T00:00:00.000Z',
    updated: '2026-01-01T00:00:00.000Z',
    id: 'page-id',
    title: 'Virtual Tour',
    entity: '',
    ...overrides,
  } as ContentPageRecord
}

function createFormValues(
  overrides: Partial<MenuItemFormValues> = {},
): MenuItemFormValues {
  return {
    label: 'Student Area',
    linkType: 'link',
    href: 'https://example.com',
    page: '',
    isNested: false,
    parent: '',
    category: 'general',
    icon: new File(['a'], 'icon.png'),
    ...overrides,
  }
}

describe('getMenuItemHrefError', () => {
  it('rejects an empty link', () => {
    expect(getMenuItemHrefError('   ')).toBe(messages.menuItems.link.empty)
  })

  it.each(['example.com', 'ftp://example.com', 'not a url'])(
    'rejects %s',
    (href) => {
      expect(getMenuItemHrefError(href)).toBe(messages.menuItems.link.invalid)
    },
  )

  it('accepts an https link', () => {
    expect(getMenuItemHrefError('  https://example.com  ')).toBeUndefined()
  })
})

describe('validateMenuItemForm', () => {
  it('accepts a complete link item', () => {
    expect(validateMenuItemForm(createFormValues(), false)).toEqual({})
  })

  it('requires a label', () => {
    const errors = validateMenuItemForm(createFormValues({ label: '  ' }), false)

    expect(errors.label).toBe(messages.menuItems.label.empty)
  })

  it('requires a category', () => {
    const errors = validateMenuItemForm(createFormValues({ category: '' }), false)

    expect(errors.category).toBe(messages.menuItems.editor.categoryRequiredError)
  })

  it('requires a page when the target is a page', () => {
    const errors = validateMenuItemForm(
      createFormValues({ linkType: 'page', page: '' }),
      false,
    )

    expect(errors.page).toBe(messages.menuItems.editor.pageRequiredError)
    expect(errors.href).toBeUndefined()
  })

  it('ignores the href when the target is a page', () => {
    const errors = validateMenuItemForm(
      createFormValues({ linkType: 'page', page: 'page-id', href: 'nonsense' }),
      false,
    )

    expect(errors.href).toBeUndefined()
  })

  it('requires a parent once the item is nested', () => {
    const errors = validateMenuItemForm(
      createFormValues({ isNested: true, parent: '' }),
      false,
    )

    expect(errors.parent).toBe(messages.menuItems.editor.parentRequiredError)
  })

  it('requires an icon when the record has none', () => {
    const errors = validateMenuItemForm(createFormValues({ icon: null }), false)

    expect(errors.icon).toBe(messages.menuItems.editor.iconRequiredError)
  })

  it('accepts a missing icon when the record already has one', () => {
    const errors = validateMenuItemForm(createFormValues({ icon: null }), true)

    expect(errors.icon).toBeUndefined()
  })
})

describe('toMenuItemFormValues', () => {
  it('reads a page-linked nested item', () => {
    const values = toMenuItemFormValues(
      createMenuItem({ page: 'page-id', parent: 'parent-id' }),
    )

    expect(values).toMatchObject({
      linkType: 'page',
      page: 'page-id',
      isNested: true,
      parent: 'parent-id',
      icon: null,
    })
  })

  it('falls back to the link target when no page is set', () => {
    const values = toMenuItemFormValues(
      createMenuItem({ href: 'https://example.com' }),
    )

    expect(values).toMatchObject({ linkType: 'link', isNested: false })
  })
})

describe('buildMenuItemPageOptions', () => {
  const freePage = createPage({ id: 'free', title: 'Free Page' })
  const takenPage = createPage({ id: 'taken', title: 'Taken Page' })
  const entityPage = createPage({ id: 'bound', title: 'Bound Page', entity: 'entity-id' })
  const owner = createMenuItem({ id: 'owner', label: 'Owner Item', page: 'taken' })

  it('marks a page nothing else claims as available', () => {
    const [option] = buildMenuItemPageOptions([freePage], [owner])

    expect(option).toEqual({
      value: 'free',
      label: 'Free Page',
      note: messages.menuItems.editor.pageAvailable,
    })
  })

  it('names the menu item holding a taken page', () => {
    const [option] = buildMenuItemPageOptions([takenPage], [owner])

    expect(option.ownerLabel).toBe('Owner Item')
    expect(option.note).toBe(
      formatMessage(messages.menuItems.editor.pageHeldByItem, 'Owner Item'),
    )
  })

  it('disables a page bound to a 3D entity', () => {
    const [option] = buildMenuItemPageOptions([entityPage], [owner])

    expect(option.disabled).toBe(true)
    expect(option.note).toBe(messages.menuItems.editor.pageHeldByEntity)
    expect(option.ownerLabel).toBeUndefined()
  })

  it('keeps the edited item own page selectable', () => {
    const [option] = buildMenuItemPageOptions([takenPage], [owner], 'owner')

    expect(option.ownerLabel).toBeUndefined()
    expect(option.note).toBe(messages.menuItems.editor.pageAvailable)
  })

  it('falls back to a placeholder for an untitled page', () => {
    const [option] = buildMenuItemPageOptions([createPage({ title: '' })], [])

    expect(option.label).toBe(messages.menuItems.editor.pageUntitled)
  })
})

describe('getMenuItemParentOptions', () => {
  // general: a -> b -> c, plus an unrelated d; social: e
  const items = [
    createMenuItem({ id: 'a', label: 'A', category: 'general' }),
    createMenuItem({ id: 'b', label: 'B', category: 'general', parent: 'a' }),
    createMenuItem({ id: 'c', label: 'C', category: 'general', parent: 'b' }),
    createMenuItem({ id: 'd', label: 'D', category: 'general' }),
    createMenuItem({ id: 'e', label: 'E', category: 'social' }),
  ]

  function optionIds(categoryId: string, currentItemId?: string) {
    return getMenuItemParentOptions(items, categoryId, currentItemId).map(
      (option) => option.value,
    )
  }

  it('offers nothing until a category is chosen', () => {
    expect(optionIds('', 'c')).toEqual([])
  })

  it('offers only items of the chosen category', () => {
    expect(optionIds('social')).toEqual(['e'])
  })

  it('excludes the item itself and everything nested under it', () => {
    expect(optionIds('general', 'a')).toEqual(['d'])
  })

  it('allows nesting under an ancestor', () => {
    expect(optionIds('general', 'c')).toEqual(['a', 'b', 'd'])
  })

  it('ignores the array order when walking the parent chain', () => {
    const reversed = [...items].reverse()

    expect(
      getMenuItemParentOptions(reversed, 'general', 'a').map((o) => o.value),
    ).toEqual(['d'])
  })

  it('terminates on a corrupted parent cycle', () => {
    const cyclic = [
      createMenuItem({ id: 'x', category: 'general', parent: 'y' }),
      createMenuItem({ id: 'y', category: 'general', parent: 'x' }),
    ]

    expect(
      getMenuItemParentOptions(cyclic, 'general', 'z').map((o) => o.value),
    ).toEqual(['x', 'y'])
  })

  it('labels an item without a label', () => {
    const [option] = getMenuItemParentOptions(
      [createMenuItem({ id: 'blank', label: '', category: 'general' })],
      'general',
    )

    expect(option.label).toBe(messages.menuItems.list.noIdentifier)
  })
})

describe('sortMenuItemsByCategory', () => {
  function withCategory(id: string, label: string, categoryLabel: string) {
    const item = createMenuItem({ id, label })

    return {
      ...item,
      expand: { category: { label: categoryLabel } },
    } as MenuItemRecord
  }

  it('groups items by category name, then by label', () => {
    const sorted = sortMenuItemsByCategory([
      withCategory('1', 'Virtual Tour', 'General'),
      withCategory('2', 'Students', 'Student Area'),
      withCategory('3', 'Admissions', 'General'),
      withCategory('4', 'Instagram', 'Social Media'),
    ])

    expect(sorted.map((item) => item.id)).toEqual(['3', '1', '4', '2'])
  })

  it('sorts accented category names by locale, not code point', () => {
    const sorted = sortMenuItemsByCategory([
      withCategory('1', 'Item', 'General'),
      withCategory('2', 'Item', 'Área do Aluno'),
    ])

    expect(sorted.map((item) => item.id)).toEqual(['2', '1'])
  })

  it('does not mutate the array it receives', () => {
    const items = [withCategory('1', 'B', 'Z'), withCategory('2', 'A', 'A')]

    sortMenuItemsByCategory(items)

    expect(items.map((item) => item.id)).toEqual(['1', '2'])
  })
})
