import { Paper, Text } from "@mantine/core";
import { useEffect, useState } from "react";

import { branding } from "@/config/branding.ts";
import messages from "@/constants/messages.json";
import { VIRTUAL_MAP_EVENTS } from "@/constants/virtual-map-constants.ts";
import { formatMessage } from "@/helpers/message-helper.ts";
import { virtualMapEventBus } from "@/helpers/virtual-map-event-bus.ts";

export default function VirtualMapFpsCounter() {
  const [fps, setFps] = useState<number | null>(null);

  useEffect(
    () =>
      virtualMapEventBus.register(VIRTUAL_MAP_EVENTS.RENDER_STATS_UPDATED, (stats) =>
        setFps(stats.fps),
      ),
    [],
  );

  if (fps === null) return null;

  return (
    <Paper
      pos="absolute"
      top={{ base: "auto", xs: 16 }}
      bottom={{ base: 16, xs: "auto" }}
      right={16}
      px="sm"
      py={4}
      radius="md"
      bg={branding.colors.surface.interactive}
      style={{ zIndex: 1, pointerEvents: "none" }}
    >
      <Text size="sm" ff="monospace" c={branding.colors.text.primary}>
        {formatMessage(messages.virtualMap.fpsCounter.fps, fps.toLocaleString())}
      </Text>
    </Paper>
  );
}
