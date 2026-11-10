import type PocketBase from "pocketbase";
import type { FileRejection } from "react-dropzone";

import messages from "@/constants/messages.json";
import { bytesToMegabytes } from "@/helpers/conversion-helper.ts";
import { formatMessage } from "@/helpers/message-helper.ts";
import type {
  DragStatus,
  DropzoneAccept,
  FileUploadLimits,
} from "@/types/file.ts";

export function getAcceptedMimeTypes(accept: DropzoneAccept): string[] {
  return Array.isArray(accept) ? accept : Object.keys(accept);
}

export function getDragStatus(
  items: DataTransferItemList | undefined,
  acceptedMimeTypes: string[],
): DragStatus {
  if (!items || items.length === 0) return "accept";

  for (let i = 0; i < items.length; i += 1) {
    const type = items[i].type;
    if (type && !acceptedMimeTypes.includes(type)) {
      return "reject";
    }
  }

  return "accept";
}

export const FILE_UPLOAD_REJECTION_NOTIFICATION = {
  color: "red",
  title: messages.files.rejection.title,
  style: { whiteSpace: "pre-line" as const },
} as const;

const FILE_TOO_LARGE = "file-too-large";
const FILE_INVALID_TYPE = "file-invalid-type";

export function getFileUrl(
  record: Record<string, unknown>,
  fileName: string,
  pocketBaseInstance: PocketBase,
): string {
  return pocketBaseInstance.files.getURL(record, fileName);
}

export function getFilenameFromUrl(url: string): string {
  try {
    const filename = new URL(url).pathname.split("/").pop();
    return filename ? decodeURIComponent(filename) : "";
  } catch {
    return "";
  }
}

export function getFileRejectionMessage(
  rejection: FileRejection,
  limits: FileUploadLimits,
): string {
  const fileName = rejection.file.name;
  const maxSizeMb = bytesToMegabytes(limits.maxSizeInBytes);

  return rejection.errors
    .map((error) => {
      switch (error.code) {
        case FILE_TOO_LARGE:
          return formatMessage(messages.files.rejection.tooLarge, {
            fileName,
            maxSizeMb: String(maxSizeMb),
          });
        case FILE_INVALID_TYPE:
          return formatMessage(messages.files.rejection.invalidType, fileName);
        default:
          return formatMessage(messages.files.rejection.unknown, {
            fileName,
            reason: error.message,
          });
      }
    })
    .join("\n");
}

export function buildFileRejectionNotification(
  fileRejections: FileRejection[],
  limits: FileUploadLimits,
) {
  const message = fileRejections
    .map((rejection) => getFileRejectionMessage(rejection, limits))
    .join("\n");

  return { ...FILE_UPLOAD_REJECTION_NOTIFICATION, message };
}