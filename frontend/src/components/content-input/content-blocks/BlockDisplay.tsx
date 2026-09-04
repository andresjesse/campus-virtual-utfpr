import BlockDisplayHeader from "@/components/content-input/content-blocks/BlockDisplayHeader.tsx";
import type { ContentPageBlockMetadata } from "@/types/content-page.ts";
import {Box} from "@mantine/core";
import useContentBlockData from "@/hooks/content-blocks/useContentBlockData.tsx";
import type {ContentPageBlockType} from "@/enums/content-pages-enum.ts";
import {BLOCK_DISPLAY_BODY} from "@/components/content-input/content-blocks/registry.ts";

type BlockDisplayProps = {
  metadata: ContentPageBlockMetadata
  onDelete: () => Promise<void>
  onEdit: (blockId: string, collectionName: ContentPageBlockType) => void
}

export default function BlockDisplay({ metadata, onDelete, onEdit }: BlockDisplayProps) {
  const { blockData, isLoading } = useContentBlockData(metadata);

  const BlockBody
    = BLOCK_DISPLAY_BODY[metadata.collectionName as ContentPageBlockType];

  return (
    <Box mb="xl">
      <BlockDisplayHeader metadata={metadata} onDelete={onDelete} onEdit={onEdit} />
      <BlockBody isLoading={isLoading} content={blockData} />
    </Box>
  )
}