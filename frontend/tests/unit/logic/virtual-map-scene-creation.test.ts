import { DirectionalLight } from 'three'

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

describe('createVirtualMapScene', () => {
  it('keeps shadows on but stops recomputing the shadow map every frame', () => {
    const { renderer, scene, controls } = createVirtualMapScene(document.createElement('canvas'))

    expect(renderer.shadowMap.enabled).toBe(true)
    expect(renderer.shadowMap.autoUpdate).toBe(false)
    expect(renderer.shadowMap.needsUpdate).toBe(false)

    const sun = scene.children.find((child) => child instanceof DirectionalLight)
    expect(sun?.castShadow).toBe(true)

    controls.dispose()
  })
})
