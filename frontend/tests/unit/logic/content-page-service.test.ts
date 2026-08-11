import { upsertBlockContent } from '@/services/content-page-service.ts'

const mockCreate = jest.fn()
const mockUpdate = jest.fn()
const mockCollection = jest.fn((_name: string) => ({
  create: mockCreate,
  update: mockUpdate,
}))

jest.mock('@/services/pocketbase.ts', () => ({
  pocketbase: {
    collection: (name: string) => mockCollection(name),
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

  it('updates a block with an id in the selected collection', async () => {
    mockUpdate.mockResolvedValue(true)
    const block = {
      id: 'block-id',
      title: 'Existing file block',
      collectionName: 'file_block',
      page: 'page-id',
      content: ['file-id'],
    }

    await expect(upsertBlockContent(block)).resolves.toBe(true)

    expect(mockCollection).toHaveBeenCalledWith('file_block')
    expect(mockUpdate).toHaveBeenCalledWith(
      'block-id',
      block,
      { requestKey: null },
    )
    expect(mockCreate).not.toHaveBeenCalled()
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
})
