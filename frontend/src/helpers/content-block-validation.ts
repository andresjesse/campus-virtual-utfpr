import {ContentPageBlocksEnum} from "@/enums/content-pages-enum.ts";
import type {ContentPageBlockValue} from "@/types/content-page.ts";
import {BLOCK_EMPTY_MESSAGES} from "@/constants/messages-constants.ts";

export function isBlockContentEmpty(
  collectionName: string,
  content: ContentPageBlockValue,
): boolean {
  if (collectionName === ContentPageBlocksEnum.FILE_BLOCK) {
    if (!content || typeof content !== "object") return true;
    const remainingUrls = content.urls.filter(
      (url) => !content.deletedUrls.includes(url),
    );
    return content.newFiles.length === 0 && remainingUrls.length === 0;
  }

  if (collectionName === ContentPageBlocksEnum.DIAGRAM_BLOCK) return false;

  const text = typeof content === "string" ? content : "";
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .trim() === "";
}

export function getEmptyContentNotification(
  collectionName: string,
  isNewBlock: boolean,
) {
  const messages =
    collectionName === ContentPageBlocksEnum.FILE_BLOCK
      ? BLOCK_EMPTY_MESSAGES.FILE
      : BLOCK_EMPTY_MESSAGES.RTF;

  return {
    title: messages.title,
    message: isNewBlock ? messages.create : messages.update,
  };
}