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

export function getContentPageErrorMessage(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return "Não foi possível concluir a operação. Tente novamente.";
  }

  const response =
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null
      ? error.response
      : null;
  const responseMessage =
    response &&
    "message" in response &&
    typeof response.message === "string"
      ? response.message.trim()
      : "";

  if (
    responseMessage &&
    /[áàâãéêíóôõúç]|\b(página|modelo|item|relacionad[ao])\b/i.test(
      responseMessage,
    )
  ) {
    return responseMessage;
  }

  const status =
    "status" in error && typeof error.status === "number" ? error.status : 0;

  if (status === 400) {
    return "Verifique os dados informados e tente novamente.";
  }

  if (status === 401) {
    return "Sua sessão expirou. Entre novamente para continuar.";
  }

  if (status === 403) {
    return "Você não tem permissão para alterar esta página.";
  }

  if (status === 404) {
    return "A página ou o elemento relacionado não foi encontrado.";
  }

  if (status >= 500) {
    return "O servidor não conseguiu salvar a página. Tente novamente mais tarde.";
  }

  return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
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
  const filePaths = fileRecord.content as string[];

  return filePaths.map((filePath) =>
    pocketBaseInstance.files.getURL(fileRecord, filePath)
  )
}