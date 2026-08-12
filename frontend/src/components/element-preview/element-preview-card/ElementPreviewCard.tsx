import { Paper, Text } from "@mantine/core";
import type { ReactNode } from "react";

import classes from "./element-preview-card.module.css";
import type {ContentPageBlockType} from "@/enums/content-pages-enum.ts";
import DraggableContainer from "@/containers/DraggableContainer.tsx";

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
  muted = false,
}: ElementPreviewCardProps) {
  return (
    <DraggableContainer dataTransported={blockType} >
      <section aria-label={`${label} (indisponível)`}>
        <Text fw={700} fz="md" mb={6}>
          {label}
        </Text>
        <Paper className={muted ? classes.muted : classes.card}>{children}</Paper>
      </section>
    </DraggableContainer>
  );
}
