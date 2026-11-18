import { Box, Text } from "@mantine/core";
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
  onSelect: (blockType: ContentPageBlockType) => void;
};

export default function ElementPreviewCard({
  children,
  label,
  blockType,
  onSelect,
}: ElementPreviewCardProps) {
  return (
    <DraggableContainer dataTransported={blockType} >
      <Box
        component="section"
        role="button"
        tabIndex={0}
        aria-label={formatMessage(messages.palette.addAriaLabel, label)}
        style={{ cursor: "pointer" }}
        onClick={() => onSelect(blockType)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect(blockType);
          }
        }}
      >
        <Text fw={700} fz="md" mb={6}>
          {label}
        </Text>
        <IllustrativeBlock >
          {children}
        </IllustrativeBlock>
      </Box>
    </DraggableContainer>
  );
}
