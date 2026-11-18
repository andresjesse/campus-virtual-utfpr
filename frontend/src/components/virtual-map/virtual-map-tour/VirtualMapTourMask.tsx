import { Box } from "@mantine/core";

import { branding } from "@/config/branding.ts";
import { getTourMaskPath } from "@/helpers/virtual-map-tour-helper.ts";
import type { VirtualMapTourRect, VirtualMapTourViewport } from "@/types/virtual-map-tour.ts";

type VirtualMapTourMaskProps = {
  viewport: VirtualMapTourViewport;
  spotlight: VirtualMapTourRect | null;
};

export default function VirtualMapTourMask({ viewport, spotlight }: VirtualMapTourMaskProps) {
  return (
    <Box
      component="svg"
      pos="fixed"
      top={0}
      left={0}
      w={viewport.width}
      h={viewport.height}
      aria-hidden
      data-testid="virtual-map-tour-mask"
      style={{ zIndex: 300, pointerEvents: "none" }}
    >
      <path
        d={getTourMaskPath(viewport, spotlight, 16)}
        fillRule="evenodd"
        style={{
          fill: `color-mix(in srgb, ${branding.colors.surface.shadow} 65%, transparent)`,
          pointerEvents: "auto",
        }}
      />
      {spotlight && (
        <rect
          x={spotlight.left}
          y={spotlight.top}
          width={spotlight.width}
          height={spotlight.height}
          rx={16}
          fill="none"
          stroke={branding.colors.brand.primary}
          strokeWidth={2}
        />
      )}
    </Box>
  );
}
