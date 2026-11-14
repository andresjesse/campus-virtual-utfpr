import { getStorageKey } from "@/config/branding.ts";

export const VIRTUAL_MAP_TOUR_STORAGE_KEY = getStorageKey("virtual-map-tour-completed");

export const VIRTUAL_MAP_TOUR_STEPS = ["welcome", "camera", "entity", "menu", "finish"] as const;

export type VirtualMapTourStep = (typeof VIRTUAL_MAP_TOUR_STEPS)[number];

export const VIRTUAL_MAP_TOUR_TARGETS = {
  canvas: "virtual-map-canvas",
  menuToggle: "virtual-map-menu-toggle",
} as const;

export type VirtualMapTourTarget =
  (typeof VIRTUAL_MAP_TOUR_TARGETS)[keyof typeof VIRTUAL_MAP_TOUR_TARGETS];

export const VIRTUAL_MAP_TOUR_STEP_TARGETS: Record<VirtualMapTourStep, VirtualMapTourTarget | null> = {
  welcome: null,
  camera: VIRTUAL_MAP_TOUR_TARGETS.canvas,
  entity: VIRTUAL_MAP_TOUR_TARGETS.canvas,
  menu: VIRTUAL_MAP_TOUR_TARGETS.menuToggle,
  finish: null,
};
