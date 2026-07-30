import * as React from "react";

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
    <div onDrop={onDrop} onDragOver={onDragOver}>
      { children }
    </div>
  )
}