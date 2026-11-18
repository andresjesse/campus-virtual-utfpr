import { Box, SimpleGrid, Text, Title } from "@mantine/core";
import { ImageIcon } from "@phosphor-icons/react";

import ElementPreviewCard from "@/components/element-preview/element-preview-card/ElementPreviewCard.tsx";
import { branding } from "@/config/branding.ts";
import { CONTENT_EDITOR_EVENTS } from "@/constants/content-constants.ts";
import messages from "@/constants/messages.json";
import { ContentPageBlocksEnum } from "@/enums/content-pages-enum.ts";
import type { ContentPageBlockType } from "@/enums/content-pages-enum.ts";
import { contentEditorEventBus } from "@/helpers/content-editor-event-bus.ts";

function requestBlock(blockType: ContentPageBlockType) {
  contentEditorEventBus.dispatch(CONTENT_EDITOR_EVENTS.BLOCK_ADD_REQUESTED, blockType);
}

export default function ElementPalette() {
  return (
    <Box
      component="aside"
      p="0.9rem"
      c={branding.colors.text.primary}
      bg={branding.colors.surface.sidebar}
      aria-label={messages.palette.ariaLabel}
    >
      <Title order={2} fz="md" ta="center" mb="md">
        {messages.palette.title}
      </Title>
      <SimpleGrid cols={{ base: 2, md: 1 }} spacing="md">
        <ElementPreviewCard
          label={messages.palette.images}
          blockType={ContentPageBlocksEnum.FILE_BLOCK}
          onSelect={requestBlock}
        >
          <ImageIcon aria-hidden size={36} weight="regular" />
        </ElementPreviewCard>
        <ElementPreviewCard
          label={messages.palette.richText}
          blockType={ContentPageBlocksEnum.RTF_BLOCK}
          onSelect={requestBlock}
        >
          <Text fw={700} fz="md">
            {messages.palette.richTextSample}
          </Text>
        </ElementPreviewCard>
      </SimpleGrid>
    </Box>
  );
}
