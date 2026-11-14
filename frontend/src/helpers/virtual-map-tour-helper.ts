import { VIRTUAL_MAP_TOUR_STORAGE_KEY } from "@/constants/virtual-map-tour-constants.ts";
import type { VirtualMapTourTarget } from "@/constants/virtual-map-tour-constants.ts";

export function getTourTargetSelector(target: VirtualMapTourTarget): string {
  return `[data-tour="${target}"]`;
}

export function hasCompletedTour(storage: Storage = window.localStorage): boolean {
  try {
    return storage.getItem(VIRTUAL_MAP_TOUR_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function markTourCompleted(storage: Storage = window.localStorage): void {
  try {
    storage.setItem(VIRTUAL_MAP_TOUR_STORAGE_KEY, "true");
  } catch {
    return;
  }
}
