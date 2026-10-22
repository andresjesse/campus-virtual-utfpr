import { Box } from "@mantine/core";
import { useMemo, useRef } from "react";

import VirtualMapEntityModal from "@/components/virtual-map/virtual-map-viewer/VirtualMapEntityModal.tsx";
import VirtualMapErrorOverlay from "@/components/virtual-map/virtual-map-viewer/VirtualMapErrorOverlay.tsx";
import VirtualMapLoadingOverlay from "@/components/virtual-map/virtual-map-viewer/VirtualMapLoadingOverlay.tsx";
import messages from "@/constants/messages.json";
import { VIRTUAL_MAP_ENTITY_LOADING_DELAY_MS } from "@/constants/virtual-map-constants.ts";
import { useDelayedFlag } from "@/hooks/use-delayed-flag.ts";
import { useLastDefined } from "@/hooks/use-last-defined.ts";
import { useVirtualMapEntityPage } from "@/hooks/use-virtual-map-entity-page.ts";
import { useVirtualMap } from "@/hooks/use-virtual-map.ts";
import { useVirtualMapSelection } from "@/hooks/use-virtual-map-selection.ts";

export default function VirtualMapViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { status, progress, error, retry } = useVirtualMap(canvasRef);
  const { selected, clearSelection } = useVirtualMapSelection();
  const entityPage = useVirtualMapEntityPage(selected);

  const { status: pageStatus, page, blocks, error: pageError, retry: retryPage } = entityPage;
  // An entity without a page also starts as "loading", so the modal waits out the delay
  // to avoid flashing open and shut when the lookup comes back empty.
  const isLoadingVisible = useDelayedFlag(
    pageStatus === "loading",
    VIRTUAL_MAP_ENTITY_LOADING_DELAY_MS,
  );
  const isModalOpen =
    selected !== null &&
    (pageStatus === "ready" || pageStatus === "error" || isLoadingVisible);
  const liveModalContent = useMemo(
    () =>
      isModalOpen
        ? { entity: selected, entityPage: { status: pageStatus, page, blocks, error: pageError, retry: retryPage } }
        : null,
    [isModalOpen, selected, pageStatus, page, blocks, pageError, retryPage],
  );
  const modalContent = useLastDefined(liveModalContent);

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
      {modalContent && (
        <VirtualMapEntityModal
          opened={isModalOpen}
          entity={modalContent.entity}
          entityPage={modalContent.entityPage}
          onClose={clearSelection}
        />
      )}
    </Box>
  );
}
