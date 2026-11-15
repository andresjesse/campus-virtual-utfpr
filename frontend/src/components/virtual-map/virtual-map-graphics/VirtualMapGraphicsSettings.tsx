import { Button, Stack, Switch, Text } from "@mantine/core";

import SegmentedChoice from "@/components/segmented-choice/SegmentedChoice.tsx";
import { branding } from "@/config/branding.ts";
import messages from "@/constants/messages.json";
import {
  VIRTUAL_MAP_PIXEL_DENSITIES,
  type VirtualMapPixelDensity,
} from "@/constants/virtual-map-graphics-constants.ts";
import { formatMessage } from "@/helpers/message-helper.ts";
import type { VirtualMapGraphicsSettings as GraphicsSettings } from "@/types/virtual-map-graphics.ts";

type VirtualMapGraphicsSettingsProps = {
  draft: GraphicsSettings;
  currentPixelRatio: number;
  isDirty: boolean;
  onChange: <Key extends keyof GraphicsSettings>(key: Key, value: GraphicsSettings[Key]) => void;
  onSave: () => void;
};

const densityOptions = VIRTUAL_MAP_PIXEL_DENSITIES.map((value) => ({
  value,
  label: messages.virtualMap.graphics.pixelDensityOptions[value],
}));

export default function VirtualMapGraphicsSettings({
  draft,
  currentPixelRatio,
  isDirty,
  onChange,
  onSave,
}: VirtualMapGraphicsSettingsProps) {
  const graphicsMessages = messages.virtualMap.graphics;
  const currentRatioLabel = formatMessage(
    graphicsMessages.currentPixelRatio,
    currentPixelRatio.toLocaleString(undefined, { maximumFractionDigits: 2 }),
  );

  return (
    <Stack gap="md" w={320}>
      <Text fw={600}>{graphicsMessages.title}</Text>
      <Switch
        label={graphicsMessages.shadowsLabel}
        description={graphicsMessages.shadowsDescription}
        checked={draft.shadowsEnabled}
        onChange={(event) => onChange("shadowsEnabled", event.currentTarget.checked)}
      />
      <Stack gap={4}>
        <SegmentedChoice
          label={graphicsMessages.pixelDensityLabel}
          options={densityOptions}
          value={draft.pixelDensity}
          onChange={(value) => onChange("pixelDensity", value as VirtualMapPixelDensity)}
        />
        <Text size="xs" c={branding.colors.text.muted}>
          {currentRatioLabel}
        </Text>
      </Stack>
      <Switch
        label={graphicsMessages.fpsCounterLabel}
        description={graphicsMessages.fpsCounterDescription}
        checked={draft.fpsCounterVisible}
        onChange={(event) => onChange("fpsCounterVisible", event.currentTarget.checked)}
      />
      <Button fullWidth disabled={!isDirty} onClick={onSave}>
        {graphicsMessages.saveLabel}
      </Button>
    </Stack>
  );
}
