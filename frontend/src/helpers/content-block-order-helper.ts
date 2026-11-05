import { PAGE_BLOCK_COLLECTIONS } from "@/constants/content-constants.ts";
import type { BlockDropPlacement, ContentPageBlockMetadata } from "@/types/content-page.ts";

export function flattenBlocksMetadata(
  grouped: Record<string, ContentPageBlockMetadata[] | undefined>,
): ContentPageBlockMetadata[] {
  return PAGE_BLOCK_COLLECTIONS
    .flatMap((collection) => grouped[collection] ?? [])
    .sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity));
}

export function moveBlock(
  blocks: ContentPageBlockMetadata[],
  fromIndex: number,
  toIndex: number,
): ContentPageBlockMetadata[] {
  const isOutOfRange = (index: number) => index < 0 || index >= blocks.length;

  if (fromIndex === toIndex || isOutOfRange(fromIndex) || isOutOfRange(toIndex)) {
    return blocks;
  }

  const moved = [...blocks];
  const [block] = moved.splice(fromIndex, 1);
  moved.splice(toIndex, 0, block);

  return moved;
}

export function getBlockKey(block: ContentPageBlockMetadata) {
  return `${block.collectionName}:${block.id}`;
}

export function getDropIndex(
  fromIndex: number,
  targetIndex: number,
  placement: BlockDropPlacement,
) {
  const slot = getDropSlot(targetIndex, placement);

  return slot > fromIndex ? slot - 1 : slot;
}

export function getDropSlot(targetIndex: number, placement: BlockDropPlacement) {
  return placement === "before" ? targetIndex : targetIndex + 1;
}

export function getBlockPositionChanges(ordered: ContentPageBlockMetadata[]) {
  return ordered.flatMap((block, position) =>
    block.position === position || !block.id
      ? []
      : [{ id: block.id, collectionName: block.collectionName, position }]
  );
}
