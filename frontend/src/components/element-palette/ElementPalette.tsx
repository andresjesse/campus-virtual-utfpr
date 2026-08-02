import { Stack, Text, Title } from "@mantine/core";
import { ImageIcon } from "@phosphor-icons/react/dist/csr/Image";

import ElementPreviewCard from "@/components/element-preview/element-preview-card/ElementPreviewCard.tsx";

import classes from "./element-palette.module.css";
import { ContentPageBlocksEnum } from "@/enums/content-pages-enum.ts";

export default function ElementPalette() {
  return (
    <aside className={classes.palette} aria-label="Elementos de conteúdo">
      <Title order={2} fz="md" ta="center" mb="md">
        Elementos
      </Title>
      <Stack gap="md">
        <ElementPreviewCard label="Imagens" muted blockType={ContentPageBlocksEnum.FILE_BLOCK}>
          <ImageIcon aria-hidden size={36} weight="regular" />
        </ElementPreviewCard>
        <ElementPreviewCard label="Texto (RTF)" blockType={ContentPageBlocksEnum.RTF_BLOCK}>
          <Text fw={700} fz="md">
            Lorem Ipsum
          </Text>
        </ElementPreviewCard>
      </Stack>
      <Text c="dimmed" size="xs" mt="md" ta="center">
        Elementos de conteúdo estarão disponíveis em uma próxima etapa.
      </Text>
    </aside>
  );
}
