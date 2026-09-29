export type FileUploadLimits = {
  maxSizeInBytes: number;
  allowedMimeTypes: string[];
};

export type DropzoneAccept = string[] | Record<string, string[]>;

export type DragStatus = "accept" | "reject";
