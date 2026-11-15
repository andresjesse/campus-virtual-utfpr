import { Box, Popover } from "@mantine/core";
import { SlidersHorizontalIcon } from "@phosphor-icons/react/dist/csr/SlidersHorizontal";
import { useState } from "react";

import VirtualMapGraphicsSettings from "@/components/virtual-map/virtual-map-graphics/VirtualMapGraphicsSettings.tsx";
import VirtualMapToolbarButton from "@/components/virtual-map/virtual-map-toolbar/VirtualMapToolbarButton.tsx";
import { branding } from "@/config/branding.ts";
import messages from "@/constants/messages.json";
import { useVirtualMapGraphicsSettings } from "@/hooks/use-virtual-map-graphics-settings.ts";

export default function VirtualMapGraphicsSettingsButton() {
  const [opened, setOpened] = useState(false);
  const { draft, isDirty, currentPixelDensity, updateDraft, reset, save } =
    useVirtualMapGraphicsSettings();

  const close = () => {
    setOpened(false);
    reset();
  };

  return (
    <Popover opened={opened} onDismiss={close} position="right-start" offset={12} trapFocus>
      <Popover.Target>
        <Box>
          <VirtualMapToolbarButton
            icon={SlidersHorizontalIcon}
            label={messages.virtualMap.graphics.buttonLabel}
            onClick={() => (opened ? close() : setOpened(true))}
          />
        </Box>
      </Popover.Target>
      <Popover.Dropdown bg={branding.colors.surface.interactive}>
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
