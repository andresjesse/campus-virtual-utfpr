import { Overlay, Progress, Stack, Text, Title } from "@mantine/core";

import { branding } from "@/config/branding.ts";
import messages from "@/constants/messages.json";
import { formatMessage } from "@/helpers/message-helper.ts";

type VirtualMapLoadingOverlayProps = {
  progress: number;
};

export default function VirtualMapLoadingOverlay({ progress }: VirtualMapLoadingOverlayProps) {
  return (
    <Overlay center color={branding.colors.surface.page} backgroundOpacity={1} zIndex={1}>
      <Stack align="center" gap="sm" w={280} role="status">
        <Title order={4} c={branding.colors.text.primary}>
          {messages.virtualMap.viewer.loadingTitle}
        </Title>
        <Progress
          value={progress}
          color="brand"
          w="100%"
          aria-label={messages.virtualMap.viewer.loadingTitle}
        />
        <Text size="sm" c={branding.colors.text.muted}>
          {formatMessage(messages.virtualMap.viewer.loadingProgress, String(progress))}
        </Text>
      </Stack>
    </Overlay>
  );
}
