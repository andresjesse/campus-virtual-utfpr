import * as React from "react";
import {Box} from "@mantine/core";

type DroppableContainerProps = {
  children: React.ReactNode,
  handleDrop: (rawData: string) => void
}

export default function DroppableContainer({ children, handleDrop }: DroppableContainerProps) {
  function onDragOver(evt: React.DragEvent) {
    evt.preventDefault();
    evt.dataTransfer.dropEffect = "copy";
  }

  function onDrop(evt: React.DragEvent) {
    evt.preventDefault();
    const rawData = evt.dataTransfer.getData("text/plain");
    handleDrop(rawData);
  }

  return (
    <Box
      flex="1 1 0"
      mih={0}
      h="100%"
      style={{ overflowY: "auto" }}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      {children}
    </Box>
  )
}