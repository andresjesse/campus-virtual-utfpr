import { Paper, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";

import { branding } from "@/config/branding.ts";
import messages from "@/constants/messages.json";
import { formatMessage } from "@/helpers/message-helper.ts";
import { virtualMapStats } from "@/helpers/virtual-map-stats.ts";
import { useFramesPerSecond } from "@/hooks/use-frames-per-second.ts";

const STATS_SAMPLE_MS = 500;

export default function VirtualMapFpsCounter() {
  const fps = useFramesPerSecond(STATS_SAMPLE_MS);
  const [stats, setStats] = useState({ ...virtualMapStats });

  useEffect(() => {
    const id = setInterval(() => setStats({ ...virtualMapStats }), STATS_SAMPLE_MS);
    return () => clearInterval(id);
  }, []);

  const label = messages.virtualMap.fpsCounter;

  return (
    <Paper
      pos="absolute"
      top={16}
      right={16}
      px="sm"
      py={4}
      radius="md"
      bg={branding.colors.surface.interactive}
      style={{ zIndex: 3, pointerEvents: "none" }}
    >
      <Stack gap={0}>
        <Text size="sm" ff="monospace" c={branding.colors.text.primary}>
          {formatMessage(label.label, String(fps))}
        </Text>
        <Text size="sm" ff="monospace" c={branding.colors.text.primary}>
          {formatMessage(label.drawCalls, String(stats.drawCalls))}
        </Text>
        <Text size="sm" ff="monospace" c={branding.colors.text.primary}>
          {formatMessage(label.triangles, String(stats.triangles))}
        </Text>
      </Stack>
    </Paper>
  );
}
