import { Stack, Text, Title } from "@mantine/core";
import { ImageIcon } from "@phosphor-icons/react/dist/csr/Image";

import ElementPreviewCard from "@/components/element-preview-card";

import classes from "./element-palette.module.css";

export default function ElementPalette() {
  return (
    <aside className={classes.palette} aria-label="Elementos de conteúdo">
      <Title order={2} fz="md" ta="center" mb="md">
        Elementos
      </Title>
      <Stack gap="md">
        <ElementPreviewCard label="Imagens" muted>
          <ImageIcon aria-hidden size={36} weight="regular" />
        </ElementPreviewCard>
        <ElementPreviewCard label="Texto (RTF)">
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
