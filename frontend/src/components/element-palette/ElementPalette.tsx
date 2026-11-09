import { Stack, Text, Title } from "@mantine/core";

import ElementPreviewCard from "@/components/element-preview/element-preview-card/ElementPreviewCard.tsx";

import messages from "@/constants/messages.json";

import classes from "./element-palette.module.css";
import { ContentPageBlocksEnum } from "@/enums/content-pages-enum.ts";
import {ImageIcon} from "@phosphor-icons/react";

export default function ElementPalette() {
  return (
    <aside className={classes.palette} aria-label={messages.palette.ariaLabel}>
      <Title order={2} fz="md" ta="center" mb="md">
        {messages.palette.title}
      </Title>
      <Stack gap="md">
        <ElementPreviewCard label={messages.palette.images}blockType={ContentPageBlocksEnum.FILE_BLOCK}>
          <ImageIcon aria-hidden size={36} weight="regular" />
        </ElementPreviewCard>
        <ElementPreviewCard label={messages.palette.richText} blockType={ContentPageBlocksEnum.RTF_BLOCK}>
          <Text fw={700} fz="md">
            {messages.palette.richTextSample}
          </Text>
        </ElementPreviewCard>
      </Stack>
    </aside>
  );
}
