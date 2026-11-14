import { VIRTUAL_MAP_TOUR_STORAGE_KEY } from "@/constants/virtual-map-tour-constants.ts";
import type { VirtualMapTourTarget } from "@/constants/virtual-map-tour-constants.ts";
import type { VirtualMapTourRect, VirtualMapTourViewport } from "@/types/virtual-map-tour.ts";

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

export function getTourSpotlight(
  rect: VirtualMapTourRect | null,
  viewport: VirtualMapTourViewport,
  padding: number,
): VirtualMapTourRect | null {
  if (!rect) return null;

  const coversViewport =
    rect.left <= 0 &&
    rect.top <= 0 &&
    rect.left + rect.width >= viewport.width &&
    rect.top + rect.height >= viewport.height;
  if (coversViewport) return null;

  return {
    top: rect.top - padding,
    left: rect.left - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };
}

export function getTourMaskPath(
  viewport: VirtualMapTourViewport,
  spotlight: VirtualMapTourRect | null,
  radius: number,
): string {
  const outer = `M0 0H${viewport.width}V${viewport.height}H0Z`;
  if (!spotlight) return outer;

  const { top, left, width, height } = spotlight;
  const r = Math.min(radius, width / 2, height / 2);
  const right = left + width;
  const bottom = top + height;

  return (
    `${outer}M${left + r} ${top}H${right - r}A${r} ${r} 0 0 1 ${right} ${top + r}` +
    `V${bottom - r}A${r} ${r} 0 0 1 ${right - r} ${bottom}` +
    `H${left + r}A${r} ${r} 0 0 1 ${left} ${bottom - r}` +
    `V${top + r}A${r} ${r} 0 0 1 ${left + r} ${top}Z`
  );
}

export function restartTour(
  storage: Storage = window.localStorage,
  reload: () => void = () => window.location.reload(),
): void {
  try {
    storage.removeItem(VIRTUAL_MAP_TOUR_STORAGE_KEY);
  } catch {
    // Unreadable storage already makes the tour show on load, so reload anyway.
  }
  reload();
}
