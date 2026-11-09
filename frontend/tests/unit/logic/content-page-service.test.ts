import messages from '@/constants/messages.json'
import { parseRelation } from '@/helpers/content-pages-service-helper.ts'
import {
  createContentPage,
  getContentPageByEntity,
  listEntityIdsWithPage,
  reorderBlocks,
  updateContentPage,
  upsertBlockContent,
} from '@/services/content-page-service.ts'

const mockCreate = jest.fn()
const mockUpdate = jest.fn()
const mockGetList = jest.fn()
const mockGetFullList = jest.fn()
const mockCollection = jest.fn((_name: string) => ({
  _name: _name,
  create: mockCreate,
  update: mockUpdate,
  getList: mockGetList,
  getFullList: mockGetFullList,
}))

jest.mock('@/services/pocketbase.ts', () => ({
  pocketbase: {
    collection: (name: string) => mockCollection(name),
    filter: (expression: string, params: Record<string, string>) =>
      expression.replace('{:entity}', `"${params.entity}"`),
  },
}))

describe('upsertBlockContent', () => {
  it('creates a block without an id in the selected collection', async () => {
    mockCreate.mockResolvedValue(true)
    const block = {
      title: 'New diagram',
      collectionName: 'diagram_block',
      page: 'page-id',
      content: ['node-a', 'node-b'],
    }

    await expect(upsertBlockContent(block)).resolves.toBe(true)

    expect(mockCollection).toHaveBeenCalledWith('diagram_block')
    expect(mockCreate).toHaveBeenCalledWith(block)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('creates a file block uploading all dropped files', async () => {
    mockCreate.mockResolvedValue(true)
    const files = [new File(['a'], 'a.png'), new File(['b'], 'b.jpg')]

    await upsertBlockContent({
      title: 'New files',
      collectionName: 'file_block',
      page: 'page-id',
      content: { newFiles: files, deletedUrls: [] },
    })

    expect(mockCollection).toHaveBeenCalledWith('file_block')
    expect(mockCreate).toHaveBeenCalledWith({
      title: 'New files',
      page: 'page-id',
      content: files,
    })
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('appends the dropped files to an existing file block keeping the previous ones', async () => {
    mockUpdate.mockResolvedValue(true)
    const files = [new File(['c'], 'c.png')]

    await upsertBlockContent({
      id: 'block-id',
      title: 'Existing files',
      collectionName: 'file_block',
      page: 'page-id',
      content: { newFiles: files, deletedUrls: [] },
    })

    expect(mockCollection).toHaveBeenCalledWith('file_block')
    expect(mockUpdate).toHaveBeenCalledWith(
      'block-id',
      {
        title: 'Existing files',
        page: 'page-id',
        'content+': files,
      },
      { requestKey: null },
    )
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('deletes the marked existing files on save', async () => {
    mockUpdate.mockResolvedValue(true)

    await upsertBlockContent({
      id: 'block-id',
      title: 'Deleting',
      collectionName: 'file_block',
      page: 'page-id',
      content: {
        newFiles: [],
        deletedUrls: [
          'http://localhost/api/files/c/r/existing.png',
          'http://localhost/api/files/c/r/second.jpg',
        ],
      },
    })

    expect(mockUpdate).toHaveBeenCalledWith(
      'block-id',
      {
        title: 'Deleting',
        page: 'page-id',
        'content-': ['existing.png', 'second.jpg'],
      },
      { requestKey: null },
    )
  })

  it('appends new files and deletes the marked ones in the same save', async () => {
    mockUpdate.mockResolvedValue(true)
    const files = [new File(['d'], 'd.png')]

    await upsertBlockContent({
      id: 'block-id',
      title: 'Both',
      collectionName: 'file_block',
      page: 'page-id',
      content: {
        newFiles: files,
        deletedUrls: ['http://localhost/api/files/c/r/existing.png'],
      },
    })

    expect(mockUpdate).toHaveBeenCalledWith(
      'block-id',
      {
        title: 'Both',
        page: 'page-id',
        'content+': files,
        'content-': ['existing.png'],
      },
      { requestKey: null },
    )
  })

  it('keeps the existing files when saving a file block without changes', async () => {
    mockUpdate.mockResolvedValue(true)

    await upsertBlockContent({
      id: 'block-id',
      title: 'Renamed',
      collectionName: 'file_block',
      page: 'page-id',
      content: {
        newFiles: [],
        deletedUrls: [],
        urls: ['http://localhost/api/files/c/r/existing.png'],
      },
    })

    expect(mockUpdate).toHaveBeenCalledWith(
      'block-id',
      {
        title: 'Renamed',
        page: 'page-id',
      },
      { requestKey: null },
    )
  })

  it('sanitizes rich-text HTML before creating the block', async () => {
    mockCreate.mockResolvedValue(true)

    await upsertBlockContent({
      title: 'Rich text',
      collectionName: 'rtf_block',
      page: 'page-id',
      content:
        '<p>Safe content</p><script>alert("unsafe")</script><img src="x" onerror="alert(1)">',
    })

    expect(mockCollection).toHaveBeenCalledWith('rtf_block')
    expect(mockCreate).toHaveBeenCalledWith({
      title: 'Rich text',
      collectionName: 'rtf_block',
      page: 'page-id',
      content: '<p>Safe content</p><img src="x">',
    })
  })

  it('sanitizes rich-text HTML before updating the block', async () => {
    mockUpdate.mockResolvedValue(true)

    await upsertBlockContent({
      id: 'rtf-id',
      title: 'Rich text',
      collectionName: 'rtf_block',
      page: 'page-id',
      content: '<p onclick="alert(1)">Updated content</p>',
    })

    expect(mockUpdate).toHaveBeenCalledWith(
      'rtf-id',
      {
        id: 'rtf-id',
        title: 'Rich text',
        collectionName: 'rtf_block',
        page: 'page-id',
        content: '<p>Updated content</p>',
      },
      { requestKey: null },
    )
  })

  it('does not write the position carried by the block metadata', async () => {
    mockUpdate.mockResolvedValue(true)

    await upsertBlockContent({
      id: 'diagram-id',
      title: 'Flow',
      collectionName: 'diagram_block',
      page: 'page-id',
      position: 4,
      content: ['node-a'],
    })

    expect(mockUpdate).toHaveBeenCalledWith(
      'diagram-id',
      {
        id: 'diagram-id',
        title: 'Flow',
        collectionName: 'diagram_block',
        page: 'page-id',
        content: ['node-a'],
      },
      { requestKey: null },
    )
  })
})

describe('reorderBlocks', () => {
  it('updates the position of the moved blocks in their own collections', async () => {
    mockUpdate.mockResolvedValue(true)

    const reordered = await reorderBlocks([
      { id: 'file-1', title: 'Gallery', collectionName: 'file_block', position: 1 },
      { id: 'rtf-1', title: 'Introduction', collectionName: 'rtf_block', position: 0 },
      { id: 'diagram-1', title: 'Flow', collectionName: 'diagram_block', position: 2 },
    ])

    expect(mockUpdate).toHaveBeenCalledTimes(2)
    expect(mockCollection).toHaveBeenCalledWith('file_block')
    expect(mockCollection).toHaveBeenCalledWith('rtf_block')
    expect(mockCollection).not.toHaveBeenCalledWith('diagram_block')
    expect(mockUpdate).toHaveBeenCalledWith('file-1', { position: 0 }, { requestKey: null })
    expect(mockUpdate).toHaveBeenCalledWith('rtf-1', { position: 1 }, { requestKey: null })
    expect(reordered.map(({ id, position }) => ({ id, position }))).toEqual([
      { id: 'file-1', position: 0 },
      { id: 'rtf-1', position: 1 },
      { id: 'diagram-1', position: 2 },
    ])
  })

  it('sends nothing when the order did not change', async () => {
    await reorderBlocks([
      { id: 'rtf-1', title: 'Introduction', collectionName: 'rtf_block', position: 0 },
      { id: 'file-1', title: 'Gallery', collectionName: 'file_block', position: 1 },
    ])

    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('rejects when one of the updates fails', async () => {
    mockUpdate.mockResolvedValueOnce(true).mockRejectedValueOnce(new Error('Update failed'))

    await expect(reorderBlocks([
      { id: 'file-1', title: 'Gallery', collectionName: 'file_block', position: 1 },
      { id: 'rtf-1', title: 'Introduction', collectionName: 'rtf_block', position: 0 },
    ])).rejects.toThrow('Update failed')
  })
})

describe('parseRelation', () => {
  it('splits an encoded relation into its type and id', () => {
    expect(parseRelation('entity:entity-a')).toEqual({
      id: 'entity-a',
      type: 'entity',
    })
  })

  it.each(['', 'entity', ':entity-a'])('rejects %j', (relation) => {
    expect(() => parseRelation(relation)).toThrow(
      messages.contentPages.editor.relationInvalidError,
    )
  })
})

describe('linking a page to a menu item', () => {
  beforeEach(() => {
    mockCreate.mockResolvedValue({ id: 'page-id' })
    mockUpdate.mockResolvedValue({ id: 'page-id' })
    mockGetFullList.mockResolvedValue([])
  })

  it('clears the link of the menu item a new page is linked to', async () => {
    await createContentPage({ title: 'Library', relation: 'menu_item:item-id' })

    expect(mockCollection).toHaveBeenCalledWith('menu_items')
    expect(mockUpdate).toHaveBeenCalledWith(
      'item-id',
      { page: 'page-id', href: '' },
      { requestKey: null },
    )
  })

  it('clears the link of the menu item an existing page is moved to', async () => {
    await updateContentPage('page-id', { title: 'Library', relation: 'menu_item:item-id' })

    expect(mockUpdate).toHaveBeenCalledWith(
      'item-id',
      { page: 'page-id', href: '' },
      { requestKey: null },
    )
  })

  it('does not touch menu items when a new page is linked to an entity', async () => {
    await createContentPage({ title: 'Library', relation: 'entity:entity-id' })

    expect(mockUpdate).not.toHaveBeenCalled()
  })
})

describe('getContentPageByEntity', () => {
  it('returns the page linked to the entity', async () => {
    const page = { id: 'page-id', title: 'Library', entity: 'entity-id' }
    mockGetList.mockResolvedValue({ items: [page] })

    await expect(getContentPageByEntity('entity-id')).resolves.toBe(page)

    expect(mockCollection).toHaveBeenCalledWith('content_page')
    expect(mockGetList).toHaveBeenCalledWith(1, 1, {
      filter: 'entity = "entity-id"',
      requestKey: null,
    })
  })

  it('returns null when the entity has no page', async () => {
    mockGetList.mockResolvedValue({ items: [] })

    await expect(getContentPageByEntity('entity-id')).resolves.toBeNull()
  })
})

describe('listEntityIdsWithPage', () => {
  it('returns the ids of the entities that have a page', async () => {
    mockGetFullList.mockResolvedValue([{ entity: 'entity-a' }, { entity: 'entity-b' }])

    await expect(listEntityIdsWithPage()).resolves.toEqual(new Set(['entity-a', 'entity-b']))

    expect(mockCollection).toHaveBeenCalledWith('content_page')
    expect(mockGetFullList).toHaveBeenCalledWith({
      fields: 'entity',
      filter: 'entity != ""',
      requestKey: null,
    })
  })

  it('returns an empty set when no entity has a page', async () => {
    mockGetFullList.mockResolvedValue([])

    await expect(listEntityIdsWithPage()).resolves.toEqual(new Set())
  })
})
