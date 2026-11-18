import { Modal, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

import FeedbackState from "@/components/feedback-state/index.tsx";
import VirtualMapBlock from "@/components/virtual-map/virtual-map-viewer/VirtualMapBlock.tsx";
import messages from "@/constants/messages.json";
import type { VirtualMapEntityPage } from "@/types/virtual-map-entity-page.ts";

type VirtualMapEntityModalProps = {
  opened: boolean;
  fallbackTitle: string;
  entityPage: VirtualMapEntityPage;
  onClose: () => void;
};

export default function VirtualMapEntityModal({
  opened,
  fallbackTitle,
  entityPage,
  onClose,
}: VirtualMapEntityModalProps) {
  const { status, page, blocks, error, retry } = entityPage;
  const theme = useMantineTheme();
  const desktopQuery = `(min-width: ${theme.breakpoints.sm})`;
  const isDesktop = useMediaQuery(desktopQuery, window.matchMedia(desktopQuery).matches, {
    getInitialValueInEffect: false,
  });

  return (
    <Modal
      opened={opened}
      centered
      size="lg"
      fullScreen={!isDesktop}
      onClose={onClose}
      title={page?.title ?? fallbackTitle}
      closeButtonProps={{ "aria-label": messages.virtualMap.entityModal.closeAriaLabel }}
    >
      {status === "loading" && <FeedbackState loading title={messages.block.list.loading} />}
      {status === "error" && (
        <FeedbackState
          title={messages.virtualMap.entityModal.loadErrorTitle}
          description={error ?? undefined}
          actionLabel={messages.common.retry}
          onAction={retry}
        />
      )}
      {status === "ready" && blocks.length === 0 && (
        <FeedbackState title={messages.virtualMap.entityModal.emptyTitle} />
      )}
      {status === "ready" &&
        blocks.map((block) => <VirtualMapBlock key={block.id} metadata={block} />)}
    </Modal>
  );
}
