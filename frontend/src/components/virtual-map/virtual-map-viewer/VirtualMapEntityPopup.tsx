import { CloseButton, Group, Paper, Stack, Text } from "@mantine/core";

import { branding } from "@/config/branding.ts";
import messages from "@/constants/messages.json";
import type { VirtualMapSelectedEntity } from "@/types/virtual-map-events.ts";

type VirtualMapEntityPopupProps = {
  entity: VirtualMapSelectedEntity;
  onClose: () => void;
};

export default function VirtualMapEntityPopup({ entity, onClose }: VirtualMapEntityPopupProps) {
  return (
    <Paper
      role="dialog"
      aria-label={messages.virtualMap.entityPopup.title}
      pos="absolute"
      bottom="1rem"
      left="1rem"
      maw="20rem"
      p="md"
      shadow="md"
      withBorder
      style={{ zIndex: 2 }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
        <Stack gap={0}>
          <Text size="xs" c={branding.colors.text.muted}>
            {messages.virtualMap.entityPopup.title}
          </Text>
          <Text fw={600}>{entity.slug}</Text>
        </Stack>
        <CloseButton
          aria-label={messages.virtualMap.entityPopup.closeAriaLabel}
          onClick={onClose}
        />
      </Group>
    </Paper>
  );
}
