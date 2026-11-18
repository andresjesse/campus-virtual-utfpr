import { getStorageKey } from "@/config/branding.ts";
import { VIRTUAL_MAP_MAX_PIXEL_RATIO } from "@/constants/virtual-map-constants.ts";
import type { VirtualMapGraphicsSettings } from "@/types/virtual-map-graphics.ts";

export const VIRTUAL_MAP_GRAPHICS_STORAGE_KEY = getStorageKey("virtual-map-graphics");

export const VIRTUAL_MAP_PIXEL_DENSITIES = ["auto", "low", "medium", "high"] as const;

export type VirtualMapPixelDensity = (typeof VIRTUAL_MAP_PIXEL_DENSITIES)[number];

export type VirtualMapPixelDensityLevel = Exclude<VirtualMapPixelDensity, "auto">;

export const VIRTUAL_MAP_PIXEL_DENSITY_RATIOS: Record<VirtualMapPixelDensityLevel, number> = {
  low: 1,
  medium: 1.5,
  high: VIRTUAL_MAP_MAX_PIXEL_RATIO,
};

export const VIRTUAL_MAP_LOW_END_DEVICE = {
  maxCores: 4,
  maxMemoryGb: 4,
} as const;

export const VIRTUAL_MAP_GRAPHICS_DEFAULTS: VirtualMapGraphicsSettings = {
  shadowsEnabled: true,
  pixelDensity: "auto",
  fpsCounterVisible: false,
};
