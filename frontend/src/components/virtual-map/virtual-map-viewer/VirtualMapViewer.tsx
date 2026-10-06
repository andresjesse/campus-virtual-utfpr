import { Box, Overlay } from "@mantine/core";
import { useRef } from "react";

import VirtualMapLoadingOverlay from "@/components/virtual-map/virtual-map-viewer/VirtualMapLoadingOverlay.tsx";
import FeedbackState from "@/components/feedback-state";
import { branding } from "@/config/branding.ts";
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
      {status === "error" && (
        <Overlay center color={branding.colors.surface.page} backgroundOpacity={1} zIndex={1}>
          <FeedbackState
            title={messages.virtualMap.viewer.loadErrorTitle}
            description={error}
            actionLabel={messages.common.retry}
            onAction={retry}
          />
        </Overlay>
      )}
    </Box>
  );
}
