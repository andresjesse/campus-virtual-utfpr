import {
  AmbientLight,
  Color,
  DirectionalLight,
  Line,
  MathUtils,
  Mesh,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Points,
  Scene,
  Texture,
  Vector3,
  WebGLRenderer,
  type BufferGeometry,
  type Material,
  type Object3D,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader, type GLTF } from "three/addons/loaders/GLTFLoader.js";

import { branding } from "@/config/branding.ts";
import {
  VIRTUAL_MAP_CAMERA,
  VIRTUAL_MAP_LIGHTING,
  VIRTUAL_MAP_MAX_PIXEL_RATIO,
  VIRTUAL_MAP_ORBIT_LIMITS,
} from "@/constants/virtual-map-constants.ts";
import type { EntityRecord, EntityTransformField } from "@/types/entity.ts";
import type { MeshRecord } from "@/types/mesh.ts";

export type MeshEntityGroup = {
  mesh: MeshRecord;
  entities: EntityRecord[];
};

export type VirtualMapScene = {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
  controls: OrbitControls;
};

const targetMin = new Vector3(
  VIRTUAL_MAP_ORBIT_LIMITS.targetMin.x,
  VIRTUAL_MAP_ORBIT_LIMITS.targetMin.y,
  VIRTUAL_MAP_ORBIT_LIMITS.targetMin.z,
);
const targetMax = new Vector3(
  VIRTUAL_MAP_ORBIT_LIMITS.targetMax.x,
  VIRTUAL_MAP_ORBIT_LIMITS.targetMax.y,
  VIRTUAL_MAP_ORBIT_LIMITS.targetMax.z,
);

export function createVirtualMapScene(canvas: HTMLCanvasElement): VirtualMapScene {
  const renderer = new WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, VIRTUAL_MAP_MAX_PIXEL_RATIO));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  const scene = new Scene();
  scene.background = new Color(branding.colors.scene.background);

  const camera = new PerspectiveCamera(
    VIRTUAL_MAP_CAMERA.fov,
    1,
    VIRTUAL_MAP_CAMERA.near,
    VIRTUAL_MAP_CAMERA.far,
  );
  const { position, target } = VIRTUAL_MAP_CAMERA;
  camera.position.set(position.x, position.y, position.z);

  scene.add(
    new AmbientLight(branding.colors.scene.ambientLight, VIRTUAL_MAP_LIGHTING.ambientIntensity),
  );
  scene.add(createSunLight());

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = VIRTUAL_MAP_ORBIT_LIMITS.dampingFactor;
  controls.minDistance = VIRTUAL_MAP_ORBIT_LIMITS.minDistance;
  controls.maxDistance = VIRTUAL_MAP_ORBIT_LIMITS.maxDistance;
  controls.maxPolarAngle = VIRTUAL_MAP_ORBIT_LIMITS.maxPolarAngle;
  controls.target.set(target.x, target.y, target.z);
  controls.addEventListener("change", () => clampControlsTarget(controls));
  controls.update();

  return { renderer, scene, camera, controls };
}

function createSunLight(): DirectionalLight {
  const {
    directionalIntensity,
    directionalPosition,
    shadowBias,
    shadowCameraExtent,
    shadowCameraFar,
    shadowMapSize,
  } = VIRTUAL_MAP_LIGHTING;

  const light = new DirectionalLight(
    branding.colors.scene.directionalLight,
    directionalIntensity,
  );
  light.position.set(directionalPosition.x, directionalPosition.y, directionalPosition.z);
  light.castShadow = true;
  light.shadow.mapSize.set(shadowMapSize, shadowMapSize);
  light.shadow.bias = shadowBias;
  light.shadow.camera.left = -shadowCameraExtent;
  light.shadow.camera.right = shadowCameraExtent;
  light.shadow.camera.top = shadowCameraExtent;
  light.shadow.camera.bottom = -shadowCameraExtent;
  light.shadow.camera.far = shadowCameraFar;

  return light;
}

export function clampControlsTarget(controls: Pick<OrbitControls, "object" | "target">) {
  const correction = controls.target.clone().clamp(targetMin, targetMax).sub(controls.target);
  if (correction.lengthSq() === 0) return;

  controls.target.add(correction);
  controls.object.position.add(correction);
}

export function applyEntityTransform(
  object: Object3D,
  entity: Pick<EntityRecord, EntityTransformField>,
) {
  object.position.set(entity.pos_x, entity.pos_y, entity.pos_z);
  object.rotation.set(
    MathUtils.degToRad(entity.rotation_x),
    MathUtils.degToRad(entity.rotation_y),
    MathUtils.degToRad(entity.rotation_z),
  );
  object.scale.set(entity.scale_x, entity.scale_y, entity.scale_z);
}

export function enableShadows(root: Object3D) {
  root.traverse((child) => {
    if (child instanceof Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

export function disposeObject3D(root: Object3D) {
  const disposed = new Set<BufferGeometry | Material | Texture>();
  const dispose = (resource: BufferGeometry | Material | Texture) => {
    if (disposed.has(resource)) return;
    disposed.add(resource);
    resource.dispose();
  };

  root.traverse((child) => {
    if (!(child instanceof Mesh || child instanceof Line || child instanceof Points)) return;

    dispose(child.geometry);

    const materials: Material[] = Array.isArray(child.material)
      ? child.material
      : [child.material];

    materials.forEach((material) => {
      Object.values(material).forEach((value) => {
        if (value instanceof Texture) dispose(value);
      });
      dispose(material);
    });
  });
}

export function getAggregateProgress(fractions: number[]): number {
  if (fractions.length === 0) return 100;

  const total = fractions.reduce(
    (sum, fraction) => sum + MathUtils.clamp(fraction, 0, 1),
    0,
  );

  return Math.round((total / fractions.length) * 100);
}

export function groupEntitiesByMesh(entities: EntityRecord[]): MeshEntityGroup[] {
  const groups = new Map<string, MeshEntityGroup>();

  entities.forEach((entity) => {
    const mesh = entity.expand?.mesh;
    if (!mesh) return;

    const group = groups.get(mesh.id);
    if (group) group.entities.push(entity);
    else groups.set(mesh.id, { mesh, entities: [entity] });
  });

  return [...groups.values()];
}

export function loadModels(
  urls: string[],
  onProgress: (percent: number) => void,
): Promise<PromiseSettledResult<GLTF>[]> {
  const loader = new GLTFLoader();
  const fractions = urls.map(() => 0);
  const report = (index: number, fraction: number) => {
    fractions[index] = fraction;
    onProgress(getAggregateProgress(fractions));
  };

  return Promise.allSettled(
    urls.map((url, index) =>
      loader
        .loadAsync(url, (event) => {
          if (event.lengthComputable) report(index, event.loaded / event.total);
        })
        .finally(() => report(index, 1)),
    ),
  );
}
