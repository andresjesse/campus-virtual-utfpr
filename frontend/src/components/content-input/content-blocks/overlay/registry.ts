import {ContentPageBlocksEnum, type ContentPageBlockType} from "@/enums/content-pages-enum.ts";
import type {ComponentType} from "react";
import RtfBlockEditor from "@/components/content-input/content-blocks/overlay/rtf-block/RtfBlockEditor.tsx";
import ImageBlockEditor from "@/components/content-input/content-blocks/overlay/image-block/ImageBlockEditor.tsx";
import DiagramBlockEditor from "@/components/content-input/content-blocks/overlay/DiagramBlockEditor.tsx";

export type BlockEditorProps = {
  content?: string,
  onChange: (value: string) => void,
}

export const CONTENT_BLOCK_EDITOR_OVERLAY_BODY: Record<
  ContentPageBlockType,
  ComponentType<BlockEditorProps>
> = {
  [ContentPageBlocksEnum.RTF_BLOCK]: RtfBlockEditor,
  [ContentPageBlocksEnum.FILE_BLOCK]: ImageBlockEditor,
  [ContentPageBlocksEnum.DIAGRAM_BLOCK]: DiagramBlockEditor
}