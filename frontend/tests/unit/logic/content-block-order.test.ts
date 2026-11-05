import {
  flattenBlocksMetadata,
  getBlockPositionChanges,
  moveBlock,
} from '@/helpers/content-block-order-helper.ts'
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

describe('moveBlock', () => {
  const blocks = [
    createBlock('intro', 'rtf_block', 0),
    createBlock('gallery', 'file_block', 1),
    createBlock('flow', 'diagram_block', 2),
  ]

  it('moves the first block to the end', () => {
    expect(ids(moveBlock(blocks, 0, 2))).toEqual(['gallery', 'flow', 'intro'])
  })

  it('moves the last block to the start', () => {
    expect(ids(moveBlock(blocks, 2, 0))).toEqual(['flow', 'intro', 'gallery'])
  })

  it('swaps neighboring blocks', () => {
    expect(ids(moveBlock(blocks, 1, 0))).toEqual(['gallery', 'intro', 'flow'])
  })

  it('does not change the original list', () => {
    moveBlock(blocks, 0, 2)

    expect(ids(blocks)).toEqual(['intro', 'gallery', 'flow'])
  })

  it.each([
    ['the same index', 1, 1],
    ['a source out of range', 3, 0],
    ['a target out of range', 0, -1],
  ])('returns the list unchanged for %s', (_case, fromIndex, toIndex) => {
    expect(moveBlock(blocks, fromIndex, toIndex)).toBe(blocks)
  })
})

describe('getBlockPositionChanges', () => {
  it('lists only the blocks whose index differs from their position', () => {
    expect(getBlockPositionChanges([
      createBlock('gallery', 'file_block', 1),
      createBlock('intro', 'rtf_block', 0),
      createBlock('flow', 'diagram_block', 2),
    ])).toEqual([
      { id: 'gallery', collectionName: 'file_block', position: 0 },
      { id: 'intro', collectionName: 'rtf_block', position: 1 },
    ])
  })

  it('renumbers blocks after a gap or without a position', () => {
    expect(getBlockPositionChanges([
      createBlock('intro', 'rtf_block', 0),
      createBlock('gallery', 'file_block', 5),
      createBlock('flow', 'diagram_block'),
    ])).toEqual([
      { id: 'gallery', collectionName: 'file_block', position: 1 },
      { id: 'flow', collectionName: 'diagram_block', position: 2 },
    ])
  })

  it('skips blocks that were never saved', () => {
    expect(getBlockPositionChanges([
      { title: 'Draft', collectionName: 'rtf_block' },
    ])).toEqual([])
  })
})
