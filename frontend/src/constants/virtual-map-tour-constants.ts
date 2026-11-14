import { getStorageKey } from "@/config/branding.ts";

export const VIRTUAL_MAP_TOUR_STORAGE_KEY = getStorageKey("virtual-map-tour-completed");

export const VIRTUAL_MAP_TOUR_STEPS = ["welcome", "camera", "entity", "menu", "finish"] as const;

export type VirtualMapTourStep = (typeof VIRTUAL_MAP_TOUR_STEPS)[number];
