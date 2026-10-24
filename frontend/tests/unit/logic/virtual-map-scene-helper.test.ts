import {
  BoxGeometry,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  Raycaster,
  Texture,
  Vector2,
  Vector3,
} from 'three'

import {
  VIRTUAL_MAP_ORBIT_LIMITS,
  VIRTUAL_MAP_POINTER,
} from '@/constants/virtual-map-constants.ts'
import {
  applyEntityHighlight,
  applyEntityTransform,
  clampControlsTarget,
  disposeObject3D,
  enableShadows,
  getAggregateProgress,
  groupEntitiesByMesh,
  isPointerClick,
  loadModels,
  pickEntity,
  pickEntityRoot,
  setPickableEntity,
  toNormalizedPointer,
} from '@/helpers/virtual-map-scene-helper.ts'
import type { EntityRecord } from '@/types/entity.ts'
import type { MeshRecord } from '@/types/mesh.ts'

const mockLoadAsync = jest.fn()

jest.mock('three/addons/loaders/GLTFLoader.js', () => ({
  GLTFLoader: jest.fn().mockImplementation(() => ({ loadAsync: mockLoadAsync })),
}))

function createMesh(id: string): MeshRecord {
  return { id, file: `${id}.glb` } as MeshRecord
}

function createEntity(id: string, mesh?: MeshRecord): EntityRecord {
  return { id, mesh: mesh?.id ?? '', expand: mesh ? { mesh } : undefined } as EntityRecord
}

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

  describe('groupEntitiesByMesh', () => {
    it('groups entities that share a mesh so it is downloaded once', () => {
      const library = createMesh('library')
      const gym = createMesh('gym')
      const first = createEntity('library-north', library)
      const second = createEntity('gym-main', gym)
      const third = createEntity('library-south', library)

      expect(groupEntitiesByMesh([first, second, third])).toEqual([
        { mesh: library, entities: [first, third] },
        { mesh: gym, entities: [second] },
      ])
    })

    it('skips entities whose mesh was not expanded', () => {
      expect(groupEntitiesByMesh([createEntity('orphan')])).toEqual([])
    })
  })

  describe('loadModels', () => {
    type ProgressEvent = { lengthComputable: boolean; loaded: number; total: number }

    it('reports the combined progress of every file and settles each one', async () => {
      const progressHandlers: ((event: ProgressEvent) => void)[] = []
      const finishers: { resolve: (value: unknown) => void; reject: (error: Error) => void }[] = []
      mockLoadAsync.mockImplementation(
        (_url: string, onProgress: (event: ProgressEvent) => void) =>
          new Promise((resolve, reject) => {
            progressHandlers.push(onProgress)
            finishers.push({ resolve, reject })
          }),
      )
      const onProgress = jest.fn()

      const loading = loadModels(['/library.glb', '/gym.glb'], onProgress)

      progressHandlers[0]({ lengthComputable: true, loaded: 50, total: 100 })
      expect(onProgress).toHaveBeenLastCalledWith(25)

      progressHandlers[1]({ lengthComputable: false, loaded: 10, total: 0 })
      expect(onProgress).toHaveBeenLastCalledWith(25)

      const model = { scene: new Group() }
      finishers[0].resolve(model)
      finishers[1].reject(new Error('Not a glTF file'))

      const results = await loading

      expect(onProgress).toHaveBeenLastCalledWith(100)
      expect(results[0]).toEqual({ status: 'fulfilled', value: model })
      expect(results[1].status).toBe('rejected')
      expect(mockLoadAsync).toHaveBeenCalledWith('/library.glb', expect.any(Function))
      expect(mockLoadAsync).toHaveBeenCalledWith('/gym.glb', expect.any(Function))
    })
  })

  describe('toNormalizedPointer', () => {
    it('maps client coordinates inside the canvas to normalized device coordinates', () => {
      const canvas = document.createElement('canvas')
      jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
        left: 100,
        top: 50,
        width: 200,
        height: 100,
      } as DOMRect)

      expect(toNormalizedPointer({ clientX: 200, clientY: 100 }, canvas)).toEqual(new Vector2(0, 0))
      expect(toNormalizedPointer({ clientX: 100, clientY: 50 }, canvas)).toEqual(new Vector2(-1, 1))
      expect(toNormalizedPointer({ clientX: 300, clientY: 150 }, canvas)).toEqual(new Vector2(1, -1))
    })
  })

  describe('isPointerClick', () => {
    const down = { clientX: 10, clientY: 10 }

    it('treats a release within the tolerance as a click', () => {
      expect(isPointerClick(down, down)).toBe(true)
      expect(
        isPointerClick(down, { clientX: 10 + VIRTUAL_MAP_POINTER.clickTolerance, clientY: 10 }),
      ).toBe(true)
    })

    it('treats a release beyond the tolerance as a drag', () => {
      expect(
        isPointerClick(down, { clientX: 10 + VIRTUAL_MAP_POINTER.clickTolerance + 1, clientY: 10 }),
      ).toBe(false)
    })
  })

  describe('pickEntity', () => {
    function createPickingScene() {
      const camera = new PerspectiveCamera(50, 1, 0.1, 100)
      camera.position.set(0, 0, 10)
      camera.lookAt(0, 0, 0)
      camera.updateMatrixWorld()

      const root = new Group()
      const child = new Group()
      child.add(new Mesh(new BoxGeometry(1, 1, 1), new MeshStandardMaterial()))
      root.add(child)
      setPickableEntity(root, { id: 'entity-1', slug: 'main-entrance' })
      root.updateMatrixWorld()

      return { camera, root }
    }

    it('returns the entity of the root that owns the hit mesh', () => {
      const { camera, root } = createPickingScene()

      expect(pickEntity(new Raycaster(), new Vector2(0, 0), camera, [root])).toEqual({
        id: 'entity-1',
        slug: 'main-entrance',
      })
    })

    it('returns null when the pointer misses every entity', () => {
      const { camera, root } = createPickingScene()

      expect(pickEntity(new Raycaster(), new Vector2(0.9, 0.9), camera, [root])).toBeNull()
    })
  })

  describe('pickEntityRoot', () => {
    it('returns the root object that owns the hit mesh', () => {
      const camera = new PerspectiveCamera(50, 1, 0.1, 100)
      camera.position.set(0, 0, 10)
      camera.lookAt(0, 0, 0)
      camera.updateMatrixWorld()

      const root = new Group()
      root.add(new Mesh(new BoxGeometry(1, 1, 1), new MeshStandardMaterial()))
      setPickableEntity(root, { id: 'entity-1', slug: 'main-entrance' })
      root.updateMatrixWorld()

      expect(pickEntityRoot(new Raycaster(), new Vector2(0, 0), camera, [root])).toBe(root)
      expect(pickEntityRoot(new Raycaster(), new Vector2(0.9, 0.9), camera, [root])).toBeNull()
    })
  })

  describe('applyEntityHighlight', () => {
    function createInstance(material: MeshStandardMaterial | MeshBasicMaterial) {
      const root = new Group()
      const mesh = new Mesh(new BoxGeometry(1, 1, 1), material)
      root.add(mesh)

      return { root, mesh }
    }

    it('tints only the highlighted instance when clones share a material', () => {
      const shared = new MeshStandardMaterial()
      const first = createInstance(shared)
      const second = createInstance(shared)

      applyEntityHighlight(first.root, '#ff0000', 0.5)

      const highlighted = first.mesh.material as MeshStandardMaterial
      expect(highlighted).not.toBe(shared)
      expect(highlighted.emissive.getHex()).toBe(new Color('#ff0000').getHex())
      expect(highlighted.emissiveIntensity).toBe(0.5)
      expect(second.mesh.material).toBe(shared)
      expect(shared.emissive.getHex()).toBe(0)
    })

    it('restores the original materials and disposes the clones', () => {
      const shared = new MeshStandardMaterial()
      const { root, mesh } = createInstance(shared)

      const restore = applyEntityHighlight(root, '#ff0000', 0.5)
      const clone = mesh.material as MeshStandardMaterial
      const disposeClone = jest.spyOn(clone, 'dispose')
      const disposeOriginal = jest.spyOn(shared, 'dispose')
      restore()

      expect(mesh.material).toBe(shared)
      expect(disposeClone).toHaveBeenCalledTimes(1)
      expect(disposeOriginal).not.toHaveBeenCalled()
    })

    it('highlights every material of a multi-material mesh', () => {
      const first = new MeshStandardMaterial()
      const second = new MeshStandardMaterial()
      const { root, mesh } = createInstance(first)
      mesh.material = [first, second]

      const restore = applyEntityHighlight(root, '#ff0000', 0.5)

      const materials = mesh.material as MeshStandardMaterial[]
      expect(materials).toHaveLength(2)
      materials.forEach((material) => expect(material.emissiveIntensity).toBe(0.5))

      restore()
      expect(mesh.material).toEqual([first, second])
    })

    it('leaves materials without an emissive channel untouched', () => {
      const basic = new MeshBasicMaterial()
      const { root, mesh } = createInstance(basic)

      const restore = applyEntityHighlight(root, '#ff0000', 0.5)

      expect(mesh.material).toBe(basic)
      expect(() => restore()).not.toThrow()
      expect(mesh.material).toBe(basic)
    })
  })
})
