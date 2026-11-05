import * as React from "react";
import {useEffect, useState} from "react";
import {Box, Flex} from "@mantine/core";
import {DotsSixVerticalIcon} from "@phosphor-icons/react/dist/csr/DotsSixVertical";
import DraggableContainer from "@/containers/DraggableContainer.tsx";
import {BLOCK_REORDER_DATA_TYPE} from "@/constants/content-constants.ts";
import {branding} from "@/config/branding.ts";
import messages from "@/constants/messages.json";
import type {BlockDropPlacement} from "@/types/content-page.ts";

type SortableBlockItemProps = {
  children: React.ReactNode
  dragId: string
  index: number
  disabled: boolean
  indicator: BlockDropPlacement | null
  onDragOverBlock: (placement: BlockDropPlacement) => void
  onDropBlock: (draggedId: string, targetIndex: number, placement: BlockDropPlacement) => void
}

export default function SortableBlockItem({
  children,
  dragId,
  index,
  disabled,
  indicator,
  onDragOverBlock,
  onDropBlock,
}: SortableBlockItemProps) {
  const [isHandlePressed, setIsHandlePressed] = useState(false);

  useEffect(() => {
    if (!isHandlePressed) return;

    const release = () => setIsHandlePressed(false);
    window.addEventListener("pointerup", release);

    return () => window.removeEventListener("pointerup", release);
  }, [isHandlePressed]);

  function accepts(evt: React.DragEvent) {
    return !disabled && evt.dataTransfer.types.includes(BLOCK_REORDER_DATA_TYPE);
  }

  function getPlacement(evt: React.DragEvent<HTMLElement>): BlockDropPlacement {
    const rect = evt.currentTarget.getBoundingClientRect();

    return evt.clientY < rect.top + rect.height / 2 ? "before" : "after";
  }

  function onDragOver(evt: React.DragEvent<HTMLElement>) {
    if (!accepts(evt)) return;
    evt.preventDefault();
    evt.dataTransfer.dropEffect = "move";
    onDragOverBlock(getPlacement(evt));
  }

  function onDrop(evt: React.DragEvent<HTMLElement>) {
    if (!accepts(evt)) return;
    evt.preventDefault();
    onDropBlock(evt.dataTransfer.getData(BLOCK_REORDER_DATA_TYPE), index, getPlacement(evt));
  }

  return (
    <Box
      pos="relative"
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={() => setIsHandlePressed(false)}
    >
      {indicator && (
        <Box
          data-testid="block-drop-indicator"
          pos="absolute"
          left={0}
          right={0}
          top={indicator === "before" ? -6 : undefined}
          bottom={indicator === "after" ? -6 : undefined}
          h={3}
          bdrs={2}
          bg={branding.colors.brand.primary}
          style={{ pointerEvents: "none" }}
        />
      )}

      <DraggableContainer
        dataTransported={dragId}
        dataType={BLOCK_REORDER_DATA_TYPE}
        effect="move"
        enabled={isHandlePressed}
      >
        <Flex gap="xs" align="flex-start">
          <Box
            title={messages.block.list.dragHandleTitle}
            c="dimmed"
            pt={4}
            style={{ cursor: disabled ? "not-allowed" : "grab" }}
            onPointerDown={() => setIsHandlePressed(!disabled)}
          >
            <DotsSixVerticalIcon aria-hidden size={18} />
          </Box>
          <Box flex={1} miw={0}>
            {children}
          </Box>
        </Flex>
      </DraggableContainer>
    </Box>
  );
}
