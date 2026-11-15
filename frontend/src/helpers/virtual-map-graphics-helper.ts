import {
  VIRTUAL_MAP_GRAPHICS_DEFAULTS,
  VIRTUAL_MAP_GRAPHICS_STORAGE_KEY,
  VIRTUAL_MAP_LOW_END_DEVICE,
  VIRTUAL_MAP_PIXEL_DENSITIES,
  VIRTUAL_MAP_PIXEL_DENSITY_RATIOS,
  type VirtualMapPixelDensity,
  type VirtualMapPixelDensityLevel,
} from "@/constants/virtual-map-graphics-constants.ts";
import type {
  VirtualMapDeviceInfo,
  VirtualMapGraphicsSettings,
} from "@/types/virtual-map-graphics.ts";

export function readDeviceInfo(): VirtualMapDeviceInfo {
  const { deviceMemory } = navigator as Navigator & { deviceMemory?: number };

  return {
    devicePixelRatio: window.devicePixelRatio,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory,
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
  };
}

function isLowEndDevice({ hardwareConcurrency, deviceMemory }: VirtualMapDeviceInfo): boolean {
  const fewCores =
    !!hardwareConcurrency && hardwareConcurrency <= VIRTUAL_MAP_LOW_END_DEVICE.maxCores;
  const littleMemory =
    deviceMemory !== undefined && deviceMemory <= VIRTUAL_MAP_LOW_END_DEVICE.maxMemoryGb;

  return fewCores || littleMemory;
}

export function resolvePixelDensityLevel(
  density: VirtualMapPixelDensity,
  device: VirtualMapDeviceInfo,
): VirtualMapPixelDensityLevel {
  if (density !== "auto") return density;
  if (isLowEndDevice(device)) return "low";
  return device.coarsePointer ? "medium" : "high";
}

export function resolvePixelRatio(
  density: VirtualMapPixelDensity,
  device: VirtualMapDeviceInfo,
): number {
  const ratio = VIRTUAL_MAP_PIXEL_DENSITY_RATIOS[resolvePixelDensityLevel(density, device)];

  return Math.min(device.devicePixelRatio || 1, ratio);
}

function isPixelDensity(value: unknown): value is VirtualMapPixelDensity {
  return VIRTUAL_MAP_PIXEL_DENSITIES.includes(value as VirtualMapPixelDensity);
}

function parseGraphicsSettings(raw: string | null): VirtualMapGraphicsSettings {
  const defaults = VIRTUAL_MAP_GRAPHICS_DEFAULTS;
  const stored: unknown = raw ? JSON.parse(raw) : null;
  if (typeof stored !== "object" || stored === null) return { ...defaults };

  const { shadowsEnabled, pixelDensity, fpsCounterVisible } = stored as Record<string, unknown>;

  return {
    shadowsEnabled: typeof shadowsEnabled === "boolean" ? shadowsEnabled : defaults.shadowsEnabled,
    pixelDensity: isPixelDensity(pixelDensity) ? pixelDensity : defaults.pixelDensity,
    fpsCounterVisible:
      typeof fpsCounterVisible === "boolean" ? fpsCounterVisible : defaults.fpsCounterVisible,
  };
}

export function loadGraphicsSettings(
  storage: Storage = window.localStorage,
): VirtualMapGraphicsSettings {
  try {
    return parseGraphicsSettings(storage.getItem(VIRTUAL_MAP_GRAPHICS_STORAGE_KEY));
  } catch {
    return { ...VIRTUAL_MAP_GRAPHICS_DEFAULTS };
  }
}

export function saveGraphicsSettings(
  settings: VirtualMapGraphicsSettings,
  storage: Storage = window.localStorage,
): void {
  try {
    storage.setItem(VIRTUAL_MAP_GRAPHICS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    return;
  }
}

export function applyGraphicsSettings(
  settings: VirtualMapGraphicsSettings,
  storage: Storage = window.localStorage,
  reload: () => void = () => window.location.reload(),
): void {
  saveGraphicsSettings(settings, storage);
  reload();
}

export function areGraphicsSettingsEqual(
  a: VirtualMapGraphicsSettings,
  b: VirtualMapGraphicsSettings,
): boolean {
  return (
    a.shadowsEnabled === b.shadowsEnabled &&
    a.pixelDensity === b.pixelDensity &&
    a.fpsCounterVisible === b.fpsCounterVisible
  );
}
