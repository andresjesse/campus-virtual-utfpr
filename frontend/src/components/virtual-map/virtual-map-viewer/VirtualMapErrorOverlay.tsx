import { Overlay } from "@mantine/core";

import FeedbackState from "@/components/feedback-state";
import { branding } from "@/config/branding.ts";
import messages from "@/constants/messages.json";

type VirtualMapErrorOverlayProps = {
  description: string;
  onRetry: () => void;
};

export default function VirtualMapErrorOverlay({
  description,
  onRetry,
}: VirtualMapErrorOverlayProps) {
  return (
    <Overlay center color={branding.colors.surface.page} backgroundOpacity={1} zIndex={1}>
      <FeedbackState
        title={messages.virtualMap.viewer.loadErrorTitle}
        description={description}
        actionLabel={messages.common.retry}
        onAction={onRetry}
      />
    </Overlay>
  );
}
