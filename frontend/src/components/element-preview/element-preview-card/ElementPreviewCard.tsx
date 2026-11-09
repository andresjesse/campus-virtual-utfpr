import { Text } from "@mantine/core";
import type { ReactNode } from "react";

import messages from "@/constants/messages.json";
import { formatMessage } from "@/helpers/message-helper.ts";
import type {ContentPageBlockType} from "@/enums/content-pages-enum.ts";
import DraggableContainer from "@/containers/DraggableContainer.tsx";
import IllustrativeBlock from "@/components/element-preview/element-preview-card/IllustrativeBlock.tsx";

type ElementPreviewCardProps = {
  children: ReactNode;
  label: string;
  blockType: ContentPageBlockType;
  muted?: boolean;
};

export default function ElementPreviewCard({
  children,
  label,
  blockType,
}: ElementPreviewCardProps) {
  return (
    <DraggableContainer dataTransported={blockType} >
      <section aria-label={formatMessage(messages.palette.previewAriaLabel, label)}>
        <Text fw={700} fz="md" mb={6}>
          {label}
        </Text>
        <IllustrativeBlock >
          {children}
        </IllustrativeBlock>
      </section>
    </DraggableContainer>
  );
}
