import * as React from "react";

type DraggableProps = {
  children: React.ReactNode,
  dataTransported: string;
  dataType?: string;
  effect?: "copy" | "move";
  enabled?: boolean;
}

export default function DraggableContainer({
  children,
  dataTransported,
  dataType = "text/plain",
  effect = "copy",
  enabled = true,
}: DraggableProps) {
  function onDragStart(evt: React.DragEvent) {
    evt.dataTransfer.setData(dataType, dataTransported);
    evt.dataTransfer.effectAllowed = effect;
  }

  return (
    <div draggable={enabled} onDragStart={enabled ? onDragStart : undefined}>
      { children }
    </div>
  )
}
