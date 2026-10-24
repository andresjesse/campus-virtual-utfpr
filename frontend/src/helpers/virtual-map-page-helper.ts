import { PAGE_BLOCK_COLLECTIONS } from "@/constants/content-constants.ts";
import type { ContentPageBlockMetadata } from "@/types/content-page.ts";

export function flattenBlocksMetadata(
  grouped: Record<string, ContentPageBlockMetadata[] | undefined>,
): ContentPageBlockMetadata[] {
  return PAGE_BLOCK_COLLECTIONS.flatMap((collection) => grouped[collection] ?? []);
}
