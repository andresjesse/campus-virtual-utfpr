import BlockDisplayHeader from "@/components/content-input/content-blocks/BlockDisplayHeader.tsx";
import type { ContentPageBlockMetadata } from "@/types/content-page.ts";
import BlockDisplayBody from "@/components/content-input/content-blocks/rtf-block/BlockDisplayBody.tsx";
import {Box} from "@mantine/core";
import useContentBlockData from "@/hooks/content-blocks/useContentBlockData.tsx";
import type {ContentPageBlockType} from "@/enums/content-pages-enum.ts";

type RtfBlockProps = {
  metadata: ContentPageBlockMetadata
  onDelete: () => Promise<void>
  onEdit: (blockId: string, collectionName: ContentPageBlockType) => void
}

export default function BlockDisplay({ metadata, onDelete, onEdit }: RtfBlockProps) {
  const { blockData, isLoading } = useContentBlockData(metadata);

  return (
    <Box mb="xl">
      <BlockDisplayHeader metadata={metadata} onDelete={onDelete} onEdit={onEdit} />
      <BlockDisplayBody isLoading={isLoading} content={blockData} />
    </Box>
  )
}