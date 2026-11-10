import { ENTITY_COLLECTION } from '@/constants/entity-constants.ts'
import {
  createEntity,
  deleteEntity,
  getEntity,
  listActiveEntities,
  listEntities,
  updateEntity,
} from '@/services/entity-service.ts'
import type { EntityFormValues } from '@/types/entity.ts'

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

// What the form holds after a few NumberInput edits: numbers and raw strings side by side.
const typedValues: EntityFormValues = {
  slug: '  main-entrance  ',
  mesh: 'mesh-id',
  is_active: false,
  pos_x: '1.5',
  pos_y: 0,
  pos_z: '-2',
  rotation_x: 0,
  rotation_y: '90',
  rotation_z: 0,
  scale_x: '2',
  scale_y: 1,
  scale_z: 1,
}

const expectedPayload = {
  slug: 'main-entrance',
  mesh: 'mesh-id',
  is_active: false,
  pos_x: 1.5,
  pos_y: 0,
  pos_z: -2,
  rotation_x: 0,
  rotation_y: 90,
  rotation_z: 0,
  scale_x: 2,
  scale_y: 1,
  scale_z: 1,
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('entity service', () => {
  it('lists entities sorted by slug with the mesh expanded', async () => {
    mockGetFullList.mockResolvedValue([])

    await expect(listEntities()).resolves.toEqual([])

    expect(mockCollection).toHaveBeenCalledWith(ENTITY_COLLECTION)
    expect(mockGetFullList).toHaveBeenCalledWith({
      expand: 'mesh',
      requestKey: null,
      sort: 'slug',
    })
  })

  it('lists only active entities with the mesh expanded', async () => {
    mockGetFullList.mockResolvedValue([])

    await expect(listActiveEntities()).resolves.toEqual([])

    expect(mockCollection).toHaveBeenCalledWith(ENTITY_COLLECTION)
    expect(mockGetFullList).toHaveBeenCalledWith({
      expand: 'mesh',
      filter: 'is_active = true',
      requestKey: null,
    })
  })

  it('reads a single entity without expanding', async () => {
    mockGetOne.mockResolvedValue({ id: 'entity-id' })

    await getEntity('entity-id')

    expect(mockCollection).toHaveBeenCalledWith(ENTITY_COLLECTION)
    expect(mockGetOne).toHaveBeenCalledWith('entity-id', { requestKey: null })
  })

  it('trims the slug and converts every transform to a number when creating', async () => {
    mockCreate.mockResolvedValue({ id: 'entity-id' })

    await createEntity(typedValues)

    expect(mockCollection).toHaveBeenCalledWith(ENTITY_COLLECTION)
    expect(mockCreate).toHaveBeenCalledWith(expectedPayload, { requestKey: null })
  })

  it('sends the same payload when updating', async () => {
    mockUpdate.mockResolvedValue({ id: 'entity-id' })

    await updateEntity('entity-id', typedValues)

    expect(mockUpdate).toHaveBeenCalledWith('entity-id', expectedPayload, {
      requestKey: null,
    })
  })

  it('keeps an inactive entity inactive instead of dropping the field', async () => {
    mockCreate.mockResolvedValue({ id: 'entity-id' })

    await createEntity({ ...typedValues, is_active: false })

    expect(mockCreate.mock.calls[0][0]).toHaveProperty('is_active', false)
  })

  it('deletes an entity', async () => {
    mockDelete.mockResolvedValue(true)

    await deleteEntity('entity-id')

    expect(mockCollection).toHaveBeenCalledWith(ENTITY_COLLECTION)
    expect(mockDelete).toHaveBeenCalledWith('entity-id', { requestKey: null })
  })
})
