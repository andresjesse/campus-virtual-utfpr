import { Modal } from "@mantine/core";

import FeedbackState from "@/components/feedback-state/index.tsx";
import VirtualMapBlock from "@/components/virtual-map/virtual-map-viewer/VirtualMapBlock.tsx";
import messages from "@/constants/messages.json";
import type { VirtualMapEntityPage } from "@/types/virtual-map-entity-page.ts";
import type { VirtualMapSelectedEntity } from "@/types/virtual-map-events.ts";

type VirtualMapEntityModalProps = {
  opened: boolean;
  entity: VirtualMapSelectedEntity;
  entityPage: VirtualMapEntityPage;
  onClose: () => void;
};

export default function VirtualMapEntityModal({
  opened,
  entity,
  entityPage,
  onClose,
}: VirtualMapEntityModalProps) {
  const { status, page, blocks, error, retry } = entityPage;

  return (
    <Modal
      opened={opened}
      centered
      size="lg"
      onClose={onClose}
      title={page?.title ?? entity.slug}
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
