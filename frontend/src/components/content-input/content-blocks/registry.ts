import {ContentPageBlocksEnum, type ContentPageBlockType} from "@/enums/content-pages-enum.ts";
import type {ComponentType} from "react";
import RtfBlockDisplayBody, {} from "@/components/content-input/content-blocks/rtf-block/RtfBlockDisplayBody.tsx";
import ImageBlockDisplayBody from "@/components/content-input/content-blocks/image-block/ImageBlockDisplayBody.tsx";
import type {ContentPageBlockValue} from "@/types/content-page.ts";
import DiagramBlockDisplayBody
  from "@/components/content-input/content-blocks/diagram-block/DiagramBlockDisplayBody.tsx";

export type BlockDisplayBodyProps = {
  isLoading: boolean;
  content?: ContentPageBlockValue
}

export const BLOCK_DISPLAY_BODY: Record<ContentPageBlockType, ComponentType<BlockDisplayBodyProps>> = {
  [ContentPageBlocksEnum.RTF_BLOCK]: RtfBlockDisplayBody,
  [ContentPageBlocksEnum.FILE_BLOCK]: ImageBlockDisplayBody,
  [ContentPageBlocksEnum.DIAGRAM_BLOCK]: DiagramBlockDisplayBody
}