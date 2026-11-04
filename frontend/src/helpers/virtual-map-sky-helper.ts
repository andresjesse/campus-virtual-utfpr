import { BackSide, Color, Mesh, ShaderMaterial, SphereGeometry } from "three";

import { branding } from "@/config/branding.ts";
import { VIRTUAL_MAP_SKY } from "@/constants/virtual-map-constants.ts";

export const SKY_GRADIENT_GLSL = `
  uniform vec3 skyTopColor;
  uniform vec3 skyBottomColor;
  uniform float skyOffset;
  uniform float skyExponent;
  uniform float skyRadius;

  vec3 skyGradient(vec3 direction) {
    float h = abs(normalize(direction * skyRadius + skyOffset).y);
    return mix(skyBottomColor, skyTopColor, pow(h, skyExponent));
  }
`;

const vertexShader = `
  varying vec3 vDirection;

  void main() {
    vDirection = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  ${SKY_GRADIENT_GLSL}

  varying vec3 vDirection;

  void main() {
    gl_FragColor = vec4(skyGradient(normalize(vDirection)), 1.0);
    #include <colorspace_fragment>
  }
`;

export function createSkyUniforms() {
  return {
    skyTopColor: { value: new Color(branding.colors.scene.skyTop) },
    skyBottomColor: { value: new Color(branding.colors.scene.skyBottom) },
    skyOffset: { value: VIRTUAL_MAP_SKY.offset },
    skyExponent: { value: VIRTUAL_MAP_SKY.exponent },
    skyRadius: { value: VIRTUAL_MAP_SKY.radius },
  };
}

export function createSkyDome(): Mesh {
  const material = new ShaderMaterial({
    uniforms: createSkyUniforms(),
    vertexShader,
    fragmentShader,
    side: BackSide,
    depthWrite: false,
  });

  const sky = new Mesh(
    new SphereGeometry(
      VIRTUAL_MAP_SKY.radius,
      VIRTUAL_MAP_SKY.widthSegments,
      VIRTUAL_MAP_SKY.heightSegments,
    ),
    material,
  );
  sky.renderOrder = -1;
  sky.onBeforeRender = (_renderer, _scene, camera) => {
    sky.position.copy(camera.position);
    sky.updateMatrixWorld();
  };

  return sky;
}
