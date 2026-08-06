import type {PocketbaseCollectionType} from "@/enums/pocketbase-collections-enum.ts";
import {pocketbase} from "@/services/pocketbase.ts";

export async function rowExists(
  id: string,
  collectionName: PocketbaseCollectionType
): Promise<boolean> {
  const result = await pocketbase
    .collection(collectionName)
    .getList(1, 1, {
      filter: pocketbase.filter('id = {:id}', { id }),
      fields: 'id',
      requestKey: null
    });

  return result.items.length > 0;
}