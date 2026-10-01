export type FileUploadLimits = {
  maxSizeInBytes: number;
  allowedMimeTypes: string[];
};

export type DropzoneAccept = string[] | Record<string, string[]>;

export type DragStatus = "accept" | "reject";

export type CurrentFile = {
  name: string;
};

export type SingleFileDropzoneLabels = {
  dropzoneTitle: string;
  dropzoneDescription: string;
  removeLabel: string;
  currentFileLabel: string;
  replaceLabel: string;
  cancelReplaceLabel: string;
};
