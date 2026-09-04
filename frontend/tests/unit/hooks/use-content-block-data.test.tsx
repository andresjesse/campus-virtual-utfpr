import { act, renderHook, waitFor } from '@testing-library/react'

import useContentBlockData from '@/hooks/content-blocks/useContentBlockData.tsx'
import {
  getBlockContent,
  upsertBlockContent as upsertBlockContentApi,
} from '@/services/content-page-service.ts'
import type { ContentPageBlockMetadata } from '@/types/content-page.ts'

jest.mock('@/services/content-page-service.ts', () => ({
  getBlockContent: jest.fn(),
  upsertBlockContent: jest.fn(),
}))

const getBlockContentMock = jest.mocked(getBlockContent)
const upsertBlockContentApiMock = jest.mocked(upsertBlockContentApi)

const metadata: ContentPageBlockMetadata = {
  id: 'block-id',
  title: 'Original title',
  collectionName: 'rtf_block',
  page: 'page-id',
}

describe('useContentBlockData', () => {
  it('fetches the content of an existing block', async () => {
    getBlockContentMock.mockResolvedValue('<p>Saved content</p>')

    const { result } = renderHook(() => useContentBlockData(metadata))

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(getBlockContentMock).toHaveBeenCalledWith('block-id', 'rtf_block')
    expect(result.current.blockData).toBe('<p>Saved content</p>')
  })

  it('does not fetch content for a new block', () => {
    const newBlockMetadata: ContentPageBlockMetadata = {
      title: 'New block',
      collectionName: 'rtf_block',
      page: 'page-id',
    }

    const { result } = renderHook(() => useContentBlockData(newBlockMetadata))

    expect(getBlockContentMock).not.toHaveBeenCalled()
    expect(result.current.blockData).toBe('')
    expect(result.current.isLoading).toBe(false)
  })

  it('saves content with the latest metadata and trims its title', async () => {
    getBlockContentMock.mockResolvedValue('<p>Old content</p>')
    upsertBlockContentApiMock.mockResolvedValue(true)

    const { result, rerender } = renderHook(
      ({ blockMetadata }) => useContentBlockData(blockMetadata),
      { initialProps: { blockMetadata: metadata } },
    )

    await waitFor(() => {
      expect(result.current.blockData).toBe('<p>Old content</p>')
    })

    rerender({
      blockMetadata: { ...metadata, title: '  Updated title  ' },
    })

    await act(async () => {
      await result.current.upsertBlockContent('<p>New content</p>')
    })

    expect(upsertBlockContentApiMock).toHaveBeenCalledWith({
      ...metadata,
      title: 'Updated title',
      content: '<p>New content</p>',
    })
    expect(result.current.blockData).toBe('<p>New content</p>')
    expect(result.current.isLoading).toBe(false)
  })

  it('keeps the previous content and clears loading when saving fails', async () => {
    const error = new Error('Save failed')
    getBlockContentMock.mockResolvedValue('<p>Existing content</p>')
    upsertBlockContentApiMock.mockRejectedValue(error)

    const { result } = renderHook(() => useContentBlockData(metadata))

    await waitFor(() => {
      expect(result.current.blockData).toBe('<p>Existing content</p>')
    })

    await act(async () => {
      await expect(
        result.current.upsertBlockContent('<p>Unsaved content</p>'),
      ).rejects.toThrow('Save failed')
    })

    expect(result.current.blockData).toBe('<p>Existing content</p>')
    expect(result.current.isLoading).toBe(false)
  })
})
