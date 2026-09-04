import type { FileRejection } from "react-dropzone";

export type FileUploadLimits = {
  maxSizeInBytes: number;
  allowedMimeTypes: string[];
};

export const FILE_UPLOAD_REJECTION_NOTIFICATION = {
  color: "red",
  title: "Arquivo(s) não aceito(s)",
  style: { whiteSpace: "pre-line" as const },
} as const;

const FILE_TOO_LARGE = "file-too-large";
const FILE_INVALID_TYPE = "file-invalid-type";

export function getFileRejectionMessage(
  rejection: FileRejection,
  limits: FileUploadLimits,
): string {
  const fileName = rejection.file.name;
  const maxSizeMb = limits.maxSizeInBytes / (1000 * 1000);

  return rejection.errors
    .map((error) => {
      switch (error.code) {
        case FILE_TOO_LARGE:
          return `"${fileName}" excede o tamanho máximo de ${maxSizeMb}MB.`;
        case FILE_INVALID_TYPE:
          return `"${fileName}" tem um formato não suportado.`;
        default:
          return `"${fileName}" — ${error.message}`;
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