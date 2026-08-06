export const PAGE_BLOCK_COLLECTIONS = ["file_block", "rtf_block", "diagram_block"] as const;
export const CONTENT_COLLECTIONS = ["content_page", ...PAGE_BLOCK_COLLECTIONS] as const;