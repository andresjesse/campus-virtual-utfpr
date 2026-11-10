import { createEventBus } from "@/helpers/event-bus.ts";
import type { VirtualMapEvents } from "@/types/virtual-map-events.ts";

export const virtualMapEventBus = createEventBus<VirtualMapEvents>();
