import type { ContentPageBlockMetadata, ContentPageRecord } from "@/types/content-page.ts";
import type { VirtualMapStatus } from "@/types/virtual-map-status.ts";

export type VirtualMapEntityPageStatus = VirtualMapStatus | "none";

export type VirtualMapEntityPage = {
  status: VirtualMapEntityPageStatus;
  page: ContentPageRecord | null;
  blocks: ContentPageBlockMetadata[];
  error: string | null;
  retry: () => void;
};

export type VirtualMapPageBlocksResult = {
  key: string;
  blocks: ContentPageBlockMetadata[];
  error: string | null;
};
