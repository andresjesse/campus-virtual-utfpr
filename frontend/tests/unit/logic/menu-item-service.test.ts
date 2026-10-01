import { CONTENT_PAGE_COLLECTION } from '@/constants/content-constants.ts'
import { MENU_ITEM_COLLECTION } from '@/constants/menu-constants.ts'
import {
  createMenuItem,
  deleteMenuItem,
  getMenuItem,
  listMenuItemPages,
  listMenuItems,
  unlinkMenuItems,
  updateMenuItem,
} from '@/services/menu-item-service.ts'
import type { MenuItemFormValues } from '@/types/menu.ts'

const mockCreate = jest.fn()
const mockDelete = jest.fn()
const mockGetFullList = jest.fn()
const mockGetOne = jest.fn()
const mockUpdate = jest.fn()
const mockCollection = jest.fn((name: string) => ({
  name,
  create: mockCreate,
  delete: mockDelete,
  getFullList: mockGetFullList,
  getOne: mockGetOne,
  update: mockUpdate,
}))

jest.mock('@/services/pocketbase.ts', () => ({
  pocketbase: {
    collection: (name: string) => mockCollection(name),
    filter: (expression: string, params: Record<string, string>) =>
      `${expression}|${JSON.stringify(params)}`,
  },
}))

function createFormValues(
  overrides: Partial<MenuItemFormValues> = {},
): MenuItemFormValues {
  return {
    label: '  Student Area  ',
    linkType: 'link',
    href: '  https://example.com  ',
    page: '',
    isNested: false,
    parent: '',
    category: 'category-id',
    icon: null,
    ...overrides,
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  mockGetFullList.mockResolvedValue([])
})

describe('menu item service', () => {
  it('lists items from the right collection with its relations expanded', async () => {
    await listMenuItems()

    expect(mockCollection).toHaveBeenCalledWith(MENU_ITEM_COLLECTION)
    expect(mockGetFullList).toHaveBeenCalledWith({
      expand: 'category,page,parent',
      requestKey: null,
      sort: 'label',
    })
  })

  it('groups the listed items by category name', async () => {
    const withCategory = (id: string, label: string) => ({
      id,
      label: 'Item',
      expand: { category: { label } },
    })
    mockGetFullList.mockResolvedValue([
      withCategory('1', 'Social Media'),
      withCategory('2', 'General'),
    ])

    const items = await listMenuItems()

    expect(items.map((item) => item.id)).toEqual(['2', '1'])
  })

  it('lists the content pages available as targets', async () => {
    await listMenuItemPages()

    expect(mockCollection).toHaveBeenCalledWith(CONTENT_PAGE_COLLECTION)
    expect(mockGetFullList).toHaveBeenCalledWith({
      requestKey: null,
      sort: 'title',
    })
  })

  it('reads a single item', async () => {
    mockGetOne.mockResolvedValue({ id: 'item-id' })

    await getMenuItem('item-id')

    expect(mockGetOne).toHaveBeenCalledWith('item-id', { requestKey: null })
  })

  it('deletes an item', async () => {
    await deleteMenuItem('item-id')

    expect(mockDelete).toHaveBeenCalledWith('item-id', { requestKey: null })
  })

  it('trims the label and clears the page when the target is a link', async () => {
    await createMenuItem(createFormValues())

    expect(mockCreate).toHaveBeenCalledWith(
      {
        label: 'Student Area',
        category: 'category-id',
        href: 'https://example.com',
        page: '',
        parent: '',
      },
      { requestKey: null },
    )
  })

  it('clears the href when the target is a page', async () => {
    await createMenuItem(
      createFormValues({ linkType: 'page', page: 'page-id' }),
    )

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ href: '', page: 'page-id' }),
      { requestKey: null },
    )
  })

  it('clears the parent when the item is not nested', async () => {
    await createMenuItem(createFormValues({ isNested: false, parent: 'parent-id' }))

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ parent: '' }),
      { requestKey: null },
    )
  })

  it('keeps the parent when the item is nested', async () => {
    await createMenuItem(createFormValues({ isNested: true, parent: 'parent-id' }))

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ parent: 'parent-id' }),
      { requestKey: null },
    )
  })

  it('uploads the icon only when a new file was chosen', async () => {
    const icon = new File(['a'], 'icon.png')

    await updateMenuItem('item-id', createFormValues({ icon }))

    expect(mockUpdate).toHaveBeenCalledWith(
      'item-id',
      expect.objectContaining({ icon }),
      { requestKey: null },
    )
  })

  it('leaves the stored icon untouched when no new file was chosen', async () => {
    await updateMenuItem('item-id', createFormValues())

    expect(mockUpdate).toHaveBeenCalledWith(
      'item-id',
      expect.not.objectContaining({ icon: expect.anything() }),
      { requestKey: null },
    )
  })

  it('releases the page from its previous owner before writing', async () => {
    const calls: string[] = []
    mockGetFullList.mockResolvedValue([{ id: 'previous-owner' }])
    mockUpdate.mockImplementation((id: string) => {
      calls.push(`update:${id}`)
      return Promise.resolve({})
    })
    mockCreate.mockImplementation(() => {
      calls.push('create')
      return Promise.resolve({})
    })

    await createMenuItem(createFormValues({ linkType: 'page', page: 'page-id' }))

    expect(calls).toEqual(['update:previous-owner', 'create'])
    expect(mockUpdate).toHaveBeenCalledWith(
      'previous-owner',
      { page: '' },
      { requestKey: null },
    )
  })

  it('does not release the page the edited item already holds', async () => {
    mockGetFullList.mockResolvedValue([{ id: 'item-id' }, { id: 'other-item' }])

    await updateMenuItem(
      'item-id',
      createFormValues({ linkType: 'page', page: 'page-id' }),
    )

    expect(mockUpdate).toHaveBeenCalledWith(
      'other-item',
      { page: '' },
      { requestKey: null },
    )
    expect(mockUpdate).not.toHaveBeenCalledWith(
      'item-id',
      { page: '' },
      { requestKey: null },
    )
  })

  it('does not touch other items when the target is a link', async () => {
    mockGetFullList.mockResolvedValue([{ id: 'previous-owner' }])

    await createMenuItem(createFormValues())

    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('clears the page of every item still holding it', async () => {
    mockGetFullList.mockResolvedValue([{ id: 'first' }, { id: 'second' }])

    await unlinkMenuItems('page-id')

    expect(mockUpdate).toHaveBeenCalledTimes(2)
    expect(mockGetFullList).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: 'page = {:page}|{"page":"page-id"}',
        requestKey: null,
        sort: 'label',
      }),
    )
  })
})
