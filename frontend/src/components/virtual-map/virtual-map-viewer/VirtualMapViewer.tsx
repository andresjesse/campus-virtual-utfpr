import { Box } from "@mantine/core";
import { useRef } from "react";

import VirtualMapErrorOverlay from "@/components/virtual-map/virtual-map-viewer/VirtualMapErrorOverlay.tsx";
import VirtualMapLoadingOverlay from "@/components/virtual-map/virtual-map-viewer/VirtualMapLoadingOverlay.tsx";
import messages from "@/constants/messages.json";
import { useVirtualMap } from "@/hooks/use-virtual-map.ts";

export default function VirtualMapViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { status, progress, error, retry } = useVirtualMap(canvasRef);

  return (
    <Box pos="relative" w="100%" h="100dvh">
      <Box
        component="canvas"
        ref={canvasRef}
        display="block"
        w="100%"
        h="100%"
        aria-label={messages.virtualMap.viewer.canvasAriaLabel}
      />
      {status === "loading" && <VirtualMapLoadingOverlay progress={progress} />}
      {status === "error" && <VirtualMapErrorOverlay description={error} onRetry={retry} />}
    </Box>
  );
}
