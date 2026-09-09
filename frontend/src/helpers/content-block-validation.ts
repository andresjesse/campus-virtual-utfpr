import {ContentPageBlocksEnum} from "@/enums/content-pages-enum.ts";
import type {ContentPageBlockValue} from "@/types/content-page.ts";
import messages from "@/constants/messages.json";

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

const EMPTY_CONTENT_MESSAGES: Record<string, { title: string; create: string; update: string }> = {
  [ContentPageBlocksEnum.FILE_BLOCK]: messages.block.file.empty,
  [ContentPageBlocksEnum.RTF_BLOCK]: messages.block.empty,
};

export function getEmptyContentNotification(
  collectionName: string,
  isNewBlock: boolean,
) {
  const emptyMessages =
    EMPTY_CONTENT_MESSAGES[collectionName] ?? EMPTY_CONTENT_MESSAGES[ContentPageBlocksEnum.RTF_BLOCK];

  return {
    title: emptyMessages.title,
    message: isNewBlock ? emptyMessages.create : emptyMessages.update,
  };
}

export function isPageMetadataReady(
  pageTitle: string,
  pageRelation: string,
): boolean {
  return Boolean(pageTitle.trim() && pageRelation);
}

export function getPageMetadataNotification(
  pageTitle: string,
  pageRelation: string,
) {
  const missingTitle = !pageTitle.trim();
  const missingRelation = !pageRelation;

  const message = missingTitle && missingRelation
    ? messages.block.page.missingFields.both
    : missingTitle
      ? messages.block.page.missingFields.title
      : messages.block.page.missingFields.relation;

  return {
    title: messages.block.page.missingFieldsTitle,
    message,
  };
}