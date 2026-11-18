import { CONTENT_EDITOR_EVENTS } from "@/constants/content-constants.ts";
import type { ContentPageBlockType } from "@/enums/content-pages-enum.ts";

export type ContentEditorEvents = {
  [CONTENT_EDITOR_EVENTS.BLOCK_ADD_REQUESTED]: ContentPageBlockType;
};
