import {ContentPageBlocksEnum, type ContentPageBlockType} from "@/enums/content-pages-enum.ts";
import type {ComponentType} from "react";
import RtfBlockEditor from "@/components/content-input/content-blocks/overlay/rtf-block/RtfBlockEditor.tsx";
import FileBlockEditor from "@/components/content-input/content-blocks/overlay/file-block/FileBlockEditor.tsx";
import DiagramBlockEditor from "@/components/content-input/content-blocks/overlay/DiagramBlockEditor.tsx";
import type {ContentPageBlockValue} from "@/types/content-page.ts";

export type BlockEditorProps = {
  content?: ContentPageBlockValue,
  onChange: (value: ContentPageBlockValue) => void,
}

export const CONTENT_BLOCK_EDITOR_OVERLAY_BODY: Record<
  ContentPageBlockType,
  ComponentType<BlockEditorProps>
> = {
  [ContentPageBlocksEnum.RTF_BLOCK]: RtfBlockEditor,
  [ContentPageBlocksEnum.FILE_BLOCK]: FileBlockEditor,
  [ContentPageBlocksEnum.DIAGRAM_BLOCK]: DiagramBlockEditor
}