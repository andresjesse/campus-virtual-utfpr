export const VIRTUAL_MAP_COLLECTIONS = ["entities", "mesh"] as const;

export const VIRTUAL_MAP_CAMERA = {
  fov: 50,
  near: 0.5,
  far: 2000,
  position: { x: 120, y: 120, z: 120 },
  target: { x: 0, y: 0, z: 0 },
} as const;

export const VIRTUAL_MAP_ORBIT_LIMITS = {
  minDistance: 5,
  maxDistance: 600,
  maxPolarAngle: Math.PI / 2 - 0.05,
  dampingFactor: 0.08,
  targetMin: { x: -300, y: 0, z: -300 },
  targetMax: { x: 300, y: 50, z: 300 },
} as const;

export const VIRTUAL_MAP_LIGHTING = {
  ambientIntensity: 0.6,
  directionalIntensity: 2.5,
  directionalPosition: { x: 150, y: 250, z: 100 },
  shadowMapSize: 2048,
  shadowCameraExtent: 300,
  shadowCameraFar: 800,
  shadowBias: -0.0005,
} as const;

export const VIRTUAL_MAP_MAX_PIXEL_RATIO = 2;
