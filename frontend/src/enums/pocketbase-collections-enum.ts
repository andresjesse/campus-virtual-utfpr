import {CONTENT_COLLECTIONS} from "@/constants/content-constants.ts";
import {VIRTUAL_MAP_COLLECTIONS} from "@/constants/virtual-map-constants.ts";
import {MENU_COLLECTIONS} from "@/constants/menu-constants.ts";
import {USER_COLLECTION} from "@/constants/user-constants.ts";

const COLLECTIONS_MERGE = [
  ...CONTENT_COLLECTIONS,
  ...VIRTUAL_MAP_COLLECTIONS,
  ...MENU_COLLECTIONS,
  USER_COLLECTION
] as const;

export const PocketbaseCollectionsEnum = Object.fromEntries(
  COLLECTIONS_MERGE.map((entry) => [entry.trim().toUpperCase(), entry])
) as {
  [K in typeof COLLECTIONS_MERGE[number] as Uppercase<K>]: K
};

export type PocketbaseCollectionType
  = typeof PocketbaseCollectionsEnum[keyof typeof PocketbaseCollectionsEnum]