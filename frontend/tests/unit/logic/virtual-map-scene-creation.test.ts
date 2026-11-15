import { DirectionalLight, type Scene } from 'three'

import { createVirtualMapScene } from '@/helpers/virtual-map-scene-helper.ts'

jest.mock('three', () => {
  const three = jest.requireActual('three')

  return {
    ...three,
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      setPixelRatio: jest.fn(),
      shadowMap: { enabled: false, autoUpdate: true, needsUpdate: false },
    })),
  }
})

function findSun(scene: Scene) {
  return scene.children.find((child) => child instanceof DirectionalLight)
}

describe('createVirtualMapScene', () => {
  it('keeps shadows on but stops recomputing the shadow map every frame', () => {
    const { renderer, scene, controls } = createVirtualMapScene(document.createElement('canvas'), {
      shadowsEnabled: true,
      pixelRatio: 2,
    })

    expect(renderer.shadowMap.enabled).toBe(true)
    expect(renderer.shadowMap.autoUpdate).toBe(false)
    expect(renderer.shadowMap.needsUpdate).toBe(false)
    expect(findSun(scene)?.castShadow).toBe(true)

    controls.dispose()
  })

  it('turns shadows off on both the renderer and the sun', () => {
    const { renderer, scene, controls } = createVirtualMapScene(document.createElement('canvas'), {
      shadowsEnabled: false,
      pixelRatio: 2,
    })

    expect(renderer.shadowMap.enabled).toBe(false)
    expect(findSun(scene)?.castShadow).toBe(false)

    controls.dispose()
  })

  it('renders at the given pixel ratio', () => {
    const { renderer, controls } = createVirtualMapScene(document.createElement('canvas'), {
      shadowsEnabled: true,
      pixelRatio: 1.5,
    })

    expect(renderer.setPixelRatio).toHaveBeenCalledWith(1.5)

    controls.dispose()
  })
})
