import { VIRTUAL_MAP_EVENTS } from "@/constants/virtual-map-constants.ts";

export type VirtualMapSelectedEntity = {
  id: string;
  slug: string;
};

export type VirtualMapRenderStats = {
  fps: number;
  drawCalls: number;
  triangles: number;
};

export type VirtualMapEvents = {
  [VIRTUAL_MAP_EVENTS.ENTITY_SELECTED]: VirtualMapSelectedEntity;
  [VIRTUAL_MAP_EVENTS.SELECTION_CLEARED]: undefined;
  [VIRTUAL_MAP_EVENTS.RENDER_STATS_UPDATED]: VirtualMapRenderStats;
};
