import { act, renderHook, waitFor } from '@testing-library/react'

import { getAllContentBlocksMetadata } from '@/helpers/content-pages-service-helper.ts'
import { useVirtualMapPageBlocks } from '@/hooks/use-virtual-map-page-blocks.ts'

jest.mock('@/helpers/content-pages-service-helper.ts', () => ({
  getAllContentBlocksMetadata: jest.fn(),
}))

const getBlocksMock = jest.mocked(getAllContentBlocksMetadata)

const page = { id: 'page-id', title: 'Study Here' } as never
const rtf = { id: 'rtf-1', title: 'About', collectionName: 'rtf_block' }
const file = { id: 'file-1', title: 'Photos', collectionName: 'file_block' }

describe('useVirtualMapPageBlocks', () => {
  beforeEach(() => jest.clearAllMocks())

  it('does nothing without a page', () => {
    const { result } = renderHook(() => useVirtualMapPageBlocks(null))

    expect(result.current.status).toBe('none')
    expect(getBlocksMock).not.toHaveBeenCalled()
  })

  it('loads the blocks in display order', async () => {
    getBlocksMock.mockResolvedValue({ rtf_block: [rtf], file_block: [file] })

    const { result } = renderHook(() => useVirtualMapPageBlocks(page))

    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(getBlocksMock).toHaveBeenCalledWith('page-id', false)
    expect(result.current.blocks).toEqual([file, rtf])
  })

  it('reports an error and recovers on retry', async () => {
    getBlocksMock.mockRejectedValueOnce(new Error('offline'))
    getBlocksMock.mockResolvedValueOnce({ rtf_block: [rtf] })

    const { result } = renderHook(() => useVirtualMapPageBlocks(page))

    await waitFor(() => expect(result.current.status).toBe('error'))
    act(() => result.current.retry())
    await waitFor(() => expect(result.current.status).toBe('ready'))
  })
})
