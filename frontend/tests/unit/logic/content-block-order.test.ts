import { flattenBlocksMetadata } from '@/helpers/content-block-order-helper.ts'
import type { ContentPageBlockMetadata } from '@/types/content-page.ts'

function createBlock(
  id: string,
  collectionName: string,
  position?: number,
): ContentPageBlockMetadata {
  return { id, title: `Block ${id}`, collectionName, position }
}

function ids(blocks: ContentPageBlockMetadata[]) {
  return blocks.map((block) => block.id)
}

describe('flattenBlocksMetadata', () => {
  it('returns no blocks for an empty group', () => {
    expect(flattenBlocksMetadata({})).toEqual([])
  })

  it('interleaves blocks of different collections by position', () => {
    const blocks = flattenBlocksMetadata({
      rtf_block: [createBlock('intro', 'rtf_block', 0), createBlock('outro', 'rtf_block', 3)],
      file_block: [createBlock('gallery', 'file_block', 1)],
      diagram_block: [createBlock('flow', 'diagram_block', 2)],
    })

    expect(ids(blocks)).toEqual(['intro', 'gallery', 'flow', 'outro'])
  })

  it('handles gaps left by deleted blocks', () => {
    const blocks = flattenBlocksMetadata({
      rtf_block: [createBlock('last', 'rtf_block', 9)],
      file_block: [createBlock('first', 'file_block', 2)],
    })

    expect(ids(blocks)).toEqual(['first', 'last'])
  })

  it('places blocks without a position after the positioned ones', () => {
    const blocks = flattenBlocksMetadata({
      file_block: [createBlock('unpositioned', 'file_block')],
      rtf_block: [createBlock('positioned', 'rtf_block', 5)],
    })

    expect(ids(blocks)).toEqual(['positioned', 'unpositioned'])
  })

  it('keeps the collection order for blocks that share a position', () => {
    const blocks = flattenBlocksMetadata({
      diagram_block: [createBlock('flow', 'diagram_block', 0)],
      rtf_block: [createBlock('intro', 'rtf_block', 0)],
      file_block: [createBlock('gallery', 'file_block', 0)],
    })

    expect(ids(blocks)).toEqual(['gallery', 'intro', 'flow'])
  })

  it('ignores groups that are not block collections', () => {
    const blocks = flattenBlocksMetadata({
      rtf_block: [createBlock('intro', 'rtf_block', 0)],
      unknown_block: [createBlock('stray', 'unknown_block', 0)],
    })

    expect(ids(blocks)).toEqual(['intro'])
  })
})
