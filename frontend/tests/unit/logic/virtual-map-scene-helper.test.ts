import {
  BoxGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  Texture,
  Vector3,
} from 'three'

import { VIRTUAL_MAP_ORBIT_LIMITS } from '@/constants/virtual-map-constants.ts'
import {
  applyEntityTransform,
  clampControlsTarget,
  disposeObject3D,
  enableShadows,
  getAggregateProgress,
} from '@/helpers/virtual-map-scene-helper.ts'

describe('virtual map scene helper', () => {
  describe('applyEntityTransform', () => {
    it('applies position and scale directly and converts rotation from degrees', () => {
      const object = new Object3D()

      applyEntityTransform(object, {
        pos_x: 10,
        pos_y: 2,
        pos_z: -5,
        rotation_x: 90,
        rotation_y: 180,
        rotation_z: -45,
        scale_x: 2,
        scale_y: 1,
        scale_z: 0.5,
      })

      expect(object.position.toArray()).toEqual([10, 2, -5])
      expect(object.rotation.x).toBeCloseTo(Math.PI / 2)
      expect(object.rotation.y).toBeCloseTo(Math.PI)
      expect(object.rotation.z).toBeCloseTo(-Math.PI / 4)
      expect(object.scale.toArray()).toEqual([2, 1, 0.5])
    })
  })

  describe('enableShadows', () => {
    it('makes every nested mesh cast and receive shadows', () => {
      const root = new Group()
      const nested = new Group()
      const mesh = new Mesh(new BoxGeometry(), new MeshStandardMaterial())
      nested.add(mesh)
      root.add(nested)

      enableShadows(root)

      expect(mesh.castShadow).toBe(true)
      expect(mesh.receiveShadow).toBe(true)
    })
  })

  describe('disposeObject3D', () => {
    it('disposes every geometry, material and texture once, even when shared', () => {
      const texture = new Texture()
      const sharedMaterial = new MeshStandardMaterial({ map: texture })
      const geometry = new BoxGeometry()
      const otherGeometry = new BoxGeometry()
      const root = new Group()
      root.add(new Mesh(geometry, sharedMaterial))
      root.add(new Mesh(otherGeometry, [sharedMaterial]))

      const spies = [geometry, otherGeometry, sharedMaterial, texture].map((resource) =>
        jest.spyOn(resource, 'dispose'),
      )

      disposeObject3D(root)

      spies.forEach((spy) => expect(spy).toHaveBeenCalledTimes(1))
    })
  })

  describe('clampControlsTarget', () => {
    it('leaves a target inside the map bounds untouched', () => {
      const camera = new PerspectiveCamera()
      camera.position.set(10, 10, 10)
      const controls = { object: camera, target: new Vector3(1, 1, 1) }

      clampControlsTarget(controls)

      expect(controls.target.toArray()).toEqual([1, 1, 1])
      expect(camera.position.toArray()).toEqual([10, 10, 10])
    })

    it('pulls an out-of-bounds target back and moves the camera by the same offset', () => {
      const { targetMax } = VIRTUAL_MAP_ORBIT_LIMITS
      const camera = new PerspectiveCamera()
      camera.position.set(targetMax.x + 60, 20, 0)
      const controls = { object: camera, target: new Vector3(targetMax.x + 50, 0, 0) }

      clampControlsTarget(controls)

      expect(controls.target.toArray()).toEqual([targetMax.x, 0, 0])
      expect(camera.position.toArray()).toEqual([targetMax.x + 10, 20, 0])
    })
  })

  describe('getAggregateProgress', () => {
    it('averages per-file fractions into a whole percentage', () => {
      expect(getAggregateProgress([0, 0.5, 1])).toBe(50)
      expect(getAggregateProgress([0.333, 0.333, 0.333])).toBe(33)
    })

    it('clamps out-of-range fractions', () => {
      expect(getAggregateProgress([1.5, -1])).toBe(50)
    })

    it('reports completion when there is nothing to load', () => {
      expect(getAggregateProgress([])).toBe(100)
    })
  })
})
