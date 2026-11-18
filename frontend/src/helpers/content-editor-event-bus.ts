import { createEventBus } from "@/helpers/event-bus.ts";
import type { ContentEditorEvents } from "@/types/content-editor-events.ts";

export const contentEditorEventBus = createEventBus<ContentEditorEvents>();
