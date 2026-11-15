import { Box, Popover, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { SlidersHorizontalIcon } from "@phosphor-icons/react/dist/csr/SlidersHorizontal";
import { useState } from "react";

import VirtualMapGraphicsSettings from "@/components/virtual-map/virtual-map-graphics/VirtualMapGraphicsSettings.tsx";
import VirtualMapToolbarButton from "@/components/virtual-map/virtual-map-toolbar/VirtualMapToolbarButton.tsx";
import { branding } from "@/config/branding.ts";
import messages from "@/constants/messages.json";
import { VIRTUAL_MAP_TOUR_TARGETS } from "@/constants/virtual-map-tour-constants.ts";
import { useVirtualMapGraphicsSettings } from "@/hooks/use-virtual-map-graphics-settings.ts";

export default function VirtualMapGraphicsSettingsButton() {
  const [opened, setOpened] = useState(false);
  const theme = useMantineTheme();
  const isNarrow = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`);
  const { draft, isDirty, currentPixelDensity, updateDraft, reset, save } =
    useVirtualMapGraphicsSettings();

  const close = () => {
    setOpened(false);
    reset();
  };

  return (
    <Popover
      opened={opened}
      onDismiss={close}
      position={isNarrow ? "bottom-start" : "right-start"}
      offset={12}
      middlewares={{ flip: true, shift: true, size: { padding: 16 } }}
      trapFocus
    >
      <Popover.Target>
        <Box data-tour={VIRTUAL_MAP_TOUR_TARGETS.graphicsSettings}>
          <VirtualMapToolbarButton
            icon={SlidersHorizontalIcon}
            label={messages.virtualMap.graphics.buttonLabel}
            onClick={() => (opened ? close() : setOpened(true))}
          />
        </Box>
      </Popover.Target>
      <Popover.Dropdown bg={branding.colors.surface.interactive} style={{ overflowY: "auto" }}>
        <VirtualMapGraphicsSettings
          draft={draft}
          currentPixelDensity={currentPixelDensity}
          isDirty={isDirty}
          onChange={updateDraft}
          onSave={save}
        />
      </Popover.Dropdown>
    </Popover>
  );
}
