import {PAGE_BLOCK_COLLECTIONS} from "@/constants/content-constants.ts";

export const ContentPageBlocksEnum = Object.fromEntries(
  PAGE_BLOCK_COLLECTIONS.map(value => [value.toUpperCase(), value]),
) as {
  [K in typeof PAGE_BLOCK_COLLECTIONS[number] as Uppercase<K>]: K
}

export type ContentPageBlockType = typeof ContentPageBlocksEnum[keyof typeof ContentPageBlocksEnum]