import * as React from "react";

type DraggableProps = {
  children: React.ReactNode,
  dataTransported: string;
}

export default function DraggableContainer({ children, dataTransported }: DraggableProps) {
  function onDragStart(evt: React.DragEvent) {
    evt.dataTransfer.setData("text/plain", dataTransported);
    evt.dataTransfer.effectAllowed = "copy";
  }

  return (
    <div draggable={true} onDragStart={onDragStart}>
      { children }
    </div>
  )
}