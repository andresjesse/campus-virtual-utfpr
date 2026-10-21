import { act, renderHook, waitFor } from '@testing-library/react'

import { getAllContentBlocksMetadata } from '@/helpers/content-pages-service-helper.ts'
import { useVirtualMapEntityPage } from '@/hooks/use-virtual-map-entity-page.ts'
import { getContentPageByEntity } from '@/services/content-page-service.ts'

jest.mock('@/services/content-page-service.ts', () => ({
  getContentPageByEntity: jest.fn(),
}))
jest.mock('@/helpers/content-pages-service-helper.ts', () => ({
  getAllContentBlocksMetadata: jest.fn(),
}))

const getContentPageByEntityMock = jest.mocked(getContentPageByEntity)
const getAllContentBlocksMetadataMock = jest.mocked(getAllContentBlocksMetadata)

const library = { id: 'library-id', slug: 'library' }
const gym = { id: 'gym-id', slug: 'gym' }
const page = { id: 'page-id', title: 'Library', entity: 'library-id' } as never
const rtf = { id: 'rtf-1', title: 'About', collectionName: 'rtf_block' }
const file = { id: 'file-1', title: 'Photos', collectionName: 'file_block' }

describe('useVirtualMapEntityPage', () => {
  beforeEach(() => jest.clearAllMocks())

  it('does nothing while no entity is selected', () => {
    const { result } = renderHook(() => useVirtualMapEntityPage(null))

    expect(result.current.status).toBe('none')
    expect(getContentPageByEntityMock).not.toHaveBeenCalled()
  })

  it('loads the page and its blocks in display order when an entity is selected', async () => {
    getContentPageByEntityMock.mockResolvedValue(page)
    getAllContentBlocksMetadataMock.mockResolvedValue({ rtf_block: [rtf], file_block: [file] })

    const { result } = renderHook(() => useVirtualMapEntityPage(library))

    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current.status).toBe('ready'))

    expect(getContentPageByEntityMock).toHaveBeenCalledWith('library-id')
    expect(getAllContentBlocksMetadataMock).toHaveBeenCalledWith('page-id', false)
    expect(result.current.page).toBe(page)
    expect(result.current.blocks).toEqual([file, rtf])
  })

  it('reports none when the entity has no page', async () => {
    getContentPageByEntityMock.mockResolvedValue(null)

    const { result } = renderHook(() => useVirtualMapEntityPage(library))

    await waitFor(() => expect(getContentPageByEntityMock).toHaveBeenCalled())
    await waitFor(() => expect(result.current.status).toBe('none'))
    expect(getAllContentBlocksMetadataMock).not.toHaveBeenCalled()
  })

  it('resets when the selection is cleared', async () => {
    getContentPageByEntityMock.mockResolvedValue(page)
    getAllContentBlocksMetadataMock.mockResolvedValue({})

    const { result, rerender } = renderHook(
      ({ selected }) => useVirtualMapEntityPage(selected),
      { initialProps: { selected: library as typeof library | null } },
    )
    await waitFor(() => expect(result.current.status).toBe('ready'))

    rerender({ selected: null })

    expect(result.current.status).toBe('none')
    expect(result.current.page).toBeNull()
  })

  it('ignores a response for an entity that is no longer selected', async () => {
    let resolveLibrary: (value: never) => void = () => {}
    getContentPageByEntityMock.mockImplementation((id) =>
      id === 'library-id'
        ? new Promise((resolve) => { resolveLibrary = resolve as typeof resolveLibrary })
        : Promise.resolve({ id: 'gym-page', title: 'Gym', entity: id } as never),
    )
    getAllContentBlocksMetadataMock.mockResolvedValue({})

    const { result, rerender } = renderHook(
      ({ selected }) => useVirtualMapEntityPage(selected),
      { initialProps: { selected: library } },
    )
    rerender({ selected: gym })
    await waitFor(() => expect(result.current.page?.title).toBe('Gym'))

    await act(async () => resolveLibrary(page))

    expect(result.current.page?.title).toBe('Gym')
  })

  it('exposes the error and loads again on retry', async () => {
    getContentPageByEntityMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))

    const { result } = renderHook(() => useVirtualMapEntityPage(library))

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.error).toEqual(expect.any(String))
    expect(result.current.error).not.toBe('')

    getContentPageByEntityMock.mockResolvedValue(page)
    getAllContentBlocksMetadataMock.mockResolvedValue({ rtf_block: [rtf] })
    act(() => result.current.retry())

    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.blocks).toEqual([rtf])
  })
})
