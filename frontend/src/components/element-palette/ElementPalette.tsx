import { Box, SimpleGrid, Text, Title } from "@mantine/core";
import { ImageIcon } from "@phosphor-icons/react";

import ElementPreviewCard from "@/components/element-preview/element-preview-card/ElementPreviewCard.tsx";
import { branding } from "@/config/branding.ts";
import messages from "@/constants/messages.json";
import { ContentPageBlocksEnum } from "@/enums/content-pages-enum.ts";

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
        <ElementPreviewCard label={messages.palette.images} blockType={ContentPageBlocksEnum.FILE_BLOCK}>
          <ImageIcon aria-hidden size={36} weight="regular" />
        </ElementPreviewCard>
        <ElementPreviewCard label={messages.palette.richText} blockType={ContentPageBlocksEnum.RTF_BLOCK}>
          <Text fw={700} fz="md">
            {messages.palette.richTextSample}
          </Text>
        </ElementPreviewCard>
      </SimpleGrid>
    </Box>
  );
}
