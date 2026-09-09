import * as React from "react";
import {Box} from "@mantine/core";
import {branding} from "@/config/branding.ts";

type DroppableContainerProps = {
  children: React.ReactNode,
  handleDrop: (rawData: string) => void
}

export default function DroppableContainer({ children, handleDrop }: DroppableContainerProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const dragDepth = React.useRef(0);

  function onDragEnter() {
    dragDepth.current += 1;
    setDragActive(true);
  }

  function onDragOver(evt: React.DragEvent) {
    evt.preventDefault();
    evt.dataTransfer.dropEffect = "copy";
  }

  function onDragLeave() {
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) {
      setDragActive(false);
    }
  }

  function onDrop(evt: React.DragEvent) {
    evt.preventDefault();
    dragDepth.current = 0;
    setDragActive(false);
    const rawData = evt.dataTransfer.getData("text/plain");
    handleDrop(rawData);
  }

  return (
    <Box
      flex="1 1 0"
      mih={0}
      h="100%"
      bd={dragActive ? `2px dashed ${branding.colors.brand.primary}` : "2px dashed transparent"}
      bg={dragActive ? `color-mix(in srgb, ${branding.colors.brand.primary} 7%, transparent)` : "transparent"}
      bdrs={8}
      style={{
        overflowY: "auto",
        boxShadow: dragActive
          ? `0 0 0 1px ${branding.colors.brand.primary}, 0 0 24px color-mix(in srgb, ${branding.colors.brand.primary} 35%, transparent)`
          : "none",
        transition: "background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease",
      }}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
    >
      {children}
    </Box>
  )
}