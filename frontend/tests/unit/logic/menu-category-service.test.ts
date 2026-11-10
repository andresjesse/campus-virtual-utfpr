import { MENU_CATEGORY_COLLECTION } from '@/constants/menu-constants.ts'
import {
  createMenuCategory,
  deleteMenuCategory,
  getMenuCategory,
  listMenuCategories,
  updateMenuCategory,
} from '@/services/menu-category-service.ts'

const mockCreate = jest.fn()
const mockDelete = jest.fn()
const mockGetFullList = jest.fn()
const mockGetOne = jest.fn()
const mockUpdate = jest.fn()
const mockCollection = jest.fn((_name: string) => ({
  _name: _name,
  create: mockCreate,
  delete: mockDelete,
  getFullList: mockGetFullList,
  getOne: mockGetOne,
  update: mockUpdate,
}))

jest.mock('@/services/pocketbase.ts', () => ({
  pocketbase: {
    collection: (name: string) => mockCollection(name),
  },
}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('menu category service', () => {
  it('lists categories sorted by label', async () => {
    mockGetFullList.mockResolvedValue([])

    await expect(listMenuCategories()).resolves.toEqual([])

    expect(mockCollection).toHaveBeenCalledWith(MENU_CATEGORY_COLLECTION)
    expect(mockGetFullList).toHaveBeenCalledWith({
      requestKey: null,
      sort: 'label',
    })
  })

  it('reads a single category', async () => {
    mockGetOne.mockResolvedValue({ id: 'category-id' })

    await getMenuCategory('category-id')

    expect(mockCollection).toHaveBeenCalledWith(MENU_CATEGORY_COLLECTION)
    expect(mockGetOne).toHaveBeenCalledWith('category-id', { requestKey: null })
  })

  it('trims the label when creating', async () => {
    mockCreate.mockResolvedValue({ id: 'category-id' })

    await createMenuCategory({ label: '  Social Media  ' })

    expect(mockCollection).toHaveBeenCalledWith(MENU_CATEGORY_COLLECTION)
    expect(mockCreate).toHaveBeenCalledWith(
      { label: 'Social Media' },
      { requestKey: null },
    )
  })

  it('trims the label when updating', async () => {
    mockUpdate.mockResolvedValue({ id: 'category-id' })

    await updateMenuCategory('category-id', { label: '  General  ' })

    expect(mockUpdate).toHaveBeenCalledWith(
      'category-id',
      { label: 'General' },
      { requestKey: null },
    )
  })

  it('deletes a category', async () => {
    mockDelete.mockResolvedValue(true)

    await deleteMenuCategory('category-id')

    expect(mockCollection).toHaveBeenCalledWith(MENU_CATEGORY_COLLECTION)
    expect(mockDelete).toHaveBeenCalledWith('category-id', { requestKey: null })
  })
})
