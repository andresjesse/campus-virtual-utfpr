export const PAGE_BLOCK_COLLECTIONS = ["file_block", "rtf_block", "diagram_block"] as const;

export const CONTENT_COLLECTIONS = ["content_page", ...PAGE_BLOCK_COLLECTIONS] as const;

export const FILE_BLOCK_MIME_TYPES = ["image/png", "image/jpg", "video/mp4"];

export const FILE_BLOCK_MAX_SIZE_IN_BYTES = 1000 * 1000 * 15