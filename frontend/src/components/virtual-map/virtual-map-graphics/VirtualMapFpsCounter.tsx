import { Paper, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";

import { branding } from "@/config/branding.ts";
import messages from "@/constants/messages.json";
import { VIRTUAL_MAP_EVENTS } from "@/constants/virtual-map-constants.ts";
import { formatMessage } from "@/helpers/message-helper.ts";
import { virtualMapEventBus } from "@/helpers/virtual-map-event-bus.ts";
import type { VirtualMapRenderStats } from "@/types/virtual-map-events.ts";

export default function VirtualMapFpsCounter() {
  const [stats, setStats] = useState<VirtualMapRenderStats | null>(null);

  useEffect(
    () => virtualMapEventBus.register(VIRTUAL_MAP_EVENTS.RENDER_STATS_UPDATED, setStats),
    [],
  );

  if (!stats) return null;

  const counterMessages = messages.virtualMap.fpsCounter;
  const lines = [
    formatMessage(counterMessages.fps, stats.fps.toLocaleString()),
    formatMessage(counterMessages.drawCalls, stats.drawCalls.toLocaleString()),
    formatMessage(counterMessages.triangles, stats.triangles.toLocaleString()),
  ];

  return (
    <Paper
      pos="absolute"
      top={16}
      right={16}
      px="sm"
      py={4}
      radius="md"
      bg={branding.colors.surface.interactive}
      style={{ zIndex: 1, pointerEvents: "none" }}
    >
      <Stack gap={0}>
        {lines.map((line, index) => (
          <Text key={index} size="sm" ff="monospace" c={branding.colors.text.primary}>
            {line}
          </Text>
        ))}
      </Stack>
    </Paper>
  );
}
