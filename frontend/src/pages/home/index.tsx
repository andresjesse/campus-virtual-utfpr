import { Anchor, Box } from "@mantine/core";
import { lazy, Suspense } from "react";
import { Link } from "react-router";

import ErrorBoundary from "@/components/error-boundary/ErrorBoundary.tsx";
import VirtualMapErrorOverlay from "@/components/virtual-map/virtual-map-viewer/VirtualMapErrorOverlay.tsx";
import VirtualMapLoadingOverlay from "@/components/virtual-map/virtual-map-viewer/VirtualMapLoadingOverlay.tsx";
import messages from "@/constants/messages.json";

const VirtualMapViewer = lazy(
  () => import("@/components/virtual-map/virtual-map-viewer/VirtualMapViewer.tsx"),
);

export default function Home() {
  return (
    <Box component="main" pos="relative" h="100dvh">
      <ErrorBoundary
        fallback={
          <VirtualMapErrorOverlay
            description={messages.virtualMap.viewer.unavailableDescription}
            onRetry={() => window.location.reload()}
          />
        }
      >
        <Suspense fallback={<VirtualMapLoadingOverlay progress={0} />}>
          <VirtualMapViewer />
        </Suspense>
      </ErrorBoundary>
      <Anchor
        component={Link}
        to="/admin"
        pos="absolute"
        top="1rem"
        right="1rem"
        fw={600}
        style={{ zIndex: 2 }}
      >
        {messages.virtualMap.home.adminLink}
      </Anchor>
    </Box>
  );
}
