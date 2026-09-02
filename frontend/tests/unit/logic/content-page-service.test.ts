import { upsertBlockContent } from '@/services/content-page-service.ts'

const mockCreate = jest.fn()
const mockUpdate = jest.fn()
const mockCollection = jest.fn((_name: string) => ({
  _name: _name,
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

  it('creates a file block uploading all dropped files', async () => {
    mockCreate.mockResolvedValue(true)
    const files = [new File(['a'], 'a.png'), new File(['b'], 'b.jpg')]

    await upsertBlockContent({
      title: 'New files',
      collectionName: 'file_block',
      page: 'page-id',
      content: files,
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
      content: files,
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

  it('keeps the existing files when saving a file block without new uploads', async () => {
    mockUpdate.mockResolvedValue(true)

    await upsertBlockContent({
      id: 'block-id',
      title: 'Renamed',
      collectionName: 'file_block',
      page: 'page-id',
      content: ['http://localhost/api/files/c/r/existing.png'],
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
})
