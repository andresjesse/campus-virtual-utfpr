import { Divider, Paper, Stack } from "@mantine/core";
import { Children, Fragment } from "react";
import type { ReactNode } from "react";

import { branding } from "@/config/branding.ts";
import messages from "@/constants/messages.json";
import type { VirtualMapToolbarPosition } from "@/types/virtual-map-toolbar.ts";

type VirtualMapToolbarProps = {
  position: VirtualMapToolbarPosition;
  children: ReactNode;
};

export default function VirtualMapToolbar({ position, children }: VirtualMapToolbarProps) {
  const items = Children.toArray(children);
  const [vertical, horizontal] = position.split("-");

  return (
    <Paper
      pos="absolute"
      top={vertical === "top" ? 16 : undefined}
      bottom={vertical === "bottom" ? 16 : undefined}
      left={horizontal === "left" ? 16 : undefined}
      right={horizontal === "right" ? 16 : undefined}
      p={4}
      radius="md"
      bg={branding.colors.surface.interactive}
      style={{ zIndex: 2 }}
    >
      <Stack
        role="toolbar"
        aria-orientation="vertical"
        aria-label={messages.virtualMap.toolbar.ariaLabel}
        gap={4}
        align="center"
      >
        {items.map((item, index) => (
          <Fragment key={index}>
            {index > 0 && <Divider w="70%" color={branding.colors.text.muted} />}
            {item}
          </Fragment>
        ))}
      </Stack>
    </Paper>
  );
}
