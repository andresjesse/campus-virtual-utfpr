import { Box, Title } from "@mantine/core";

import { BLOCK_DISPLAY_BODY } from "@/components/content-input/content-blocks/registry.ts";
import messages from "@/constants/messages.json";
import type { ContentPageBlockType } from "@/enums/content-pages-enum.ts";
import useContentBlockData from "@/hooks/content-blocks/useContentBlockData.tsx";
import type { ContentPageBlockMetadata } from "@/types/content-page.ts";

type VirtualMapBlockProps = {
  metadata: ContentPageBlockMetadata;
};

export default function VirtualMapBlock({ metadata }: VirtualMapBlockProps) {
  const { blockData, isLoading } = useContentBlockData(metadata);

  const BlockBody = BLOCK_DISPLAY_BODY[metadata.collectionName as ContentPageBlockType];
  const title = metadata.title || messages.block.list.untitled;

  return (
    <Box mb="xl">
      <Title order={4} mb="xs">{title}</Title>
      <BlockBody isLoading={isLoading} content={blockData} />
    </Box>
  );
}
