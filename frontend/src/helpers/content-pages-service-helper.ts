import type {
  ContentPageBlockRecord,
  GroupedContentPageBlockMetadata,
  RelatedType
} from "@/types/content-page.ts";
import {
  getDiagramBlocksMetadata,
  getFileBlocksMetadata,
  getRtfBlocksMetadata
} from "@/services/content-page-service.ts";
import type PocketBase from "pocketbase";
import {getFileUrl} from "@/helpers/file-helper.ts";

export function encodeRelation(type: RelatedType, id: string) {
  return `${type}:${id}`;
}

export function parseRelation(relation: string) {
  const separator = relation.indexOf(":");

  if (separator < 1) {
    throw new Error("Selecione um elemento relacionado válido.");
  }

  return {
    id: relation.slice(separator + 1),
    type: relation.slice(0, separator) as RelatedType,
  };
}

// TODO: Verify possibility of turning this into a generic call (just like I did for the page blocks content)
export async function getAllContentBlocksMetadata(
  pageId: string,
  withTimestamps: boolean
): Promise<GroupedContentPageBlockMetadata> {
  const groupedMetadata = await Promise.all([
    getRtfBlocksMetadata(pageId, withTimestamps),
    getDiagramBlocksMetadata(pageId, withTimestamps),
    getFileBlocksMetadata(pageId, withTimestamps),
  ]);
  return Object.fromEntries(groupedMetadata
    .filter((entry) => entry.length > 0)
    .map((entry) => [
      entry[0].collectionName,
      entry
    ])
  )
}

export function generateFilesUrl(
  fileRecord: ContentPageBlockRecord,
  pocketBaseInstance: PocketBase
): string[]
{
  const filePaths = fileRecord.content as unknown as string[];

  return filePaths.map((filePath) =>
    getFileUrl(fileRecord, filePath, pocketBaseInstance)
  )
}