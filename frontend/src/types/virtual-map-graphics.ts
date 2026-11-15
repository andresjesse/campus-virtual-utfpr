import type { VirtualMapPixelDensity } from "@/constants/virtual-map-graphics-constants.ts";

export type VirtualMapGraphicsSettings = {
  shadowsEnabled: boolean;
  pixelDensity: VirtualMapPixelDensity;
  fpsCounterVisible: boolean;
};

export type VirtualMapDeviceInfo = {
  devicePixelRatio: number;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  coarsePointer: boolean;
};
