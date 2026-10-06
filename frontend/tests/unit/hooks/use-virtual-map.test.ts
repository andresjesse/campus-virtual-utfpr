import { notifications } from '@mantine/notifications'
import { act, renderHook, waitFor } from '@testing-library/react'
import { Group, PerspectiveCamera, Scene } from 'three'

import messages from '@/constants/messages.json'
import { formatMessage } from '@/helpers/message-helper.ts'
import { getRequestErrorMessage } from '@/helpers/request-error-helper.ts'
import {
  createVirtualMapScene,
  disposeObject3D,
  loadModels,
} from '@/helpers/virtual-map-scene-helper.ts'
import { useVirtualMap } from '@/hooks/use-virtual-map.ts'
import { listActiveEntities } from '@/services/entity-service.ts'
import { getMeshFileUrl } from '@/services/mesh-service.ts'
import type { EntityRecord } from '@/types/entity.ts'
import type { MeshRecord } from '@/types/mesh.ts'

jest.mock('@mantine/notifications', () => ({
  notifications: { show: jest.fn() },
}))

jest.mock('@/helpers/virtual-map-scene-helper.ts', () => ({
  ...jest.requireActual('@/helpers/virtual-map-scene-helper.ts'),
  createVirtualMapScene: jest.fn(),
  disposeObject3D: jest.fn(),
  loadModels: jest.fn(),
}))

jest.mock('@/services/entity-service.ts', () => ({
  listActiveEntities: jest.fn(),
}))

jest.mock('@/services/mesh-service.ts', () => ({
  getMeshFileUrl: jest.fn((mesh: MeshRecord) => `/files/${mesh.file}`),
}))

const createSceneMock = jest.mocked(createVirtualMapScene)
const disposeMock = jest.mocked(disposeObject3D)
const loadModelsMock = jest.mocked(loadModels)
const listActiveEntitiesMock = jest.mocked(listActiveEntities)
const showMock = jest.mocked(notifications.show)

const library = { id: 'library', file: 'library.glb' } as MeshRecord
const gym = { id: 'gym', file: 'gym.glb' } as MeshRecord

function createEntity(id: string, mesh: MeshRecord, pos_x = 0): EntityRecord {
  return {
    id,
    mesh: mesh.id,
    expand: { mesh },
    pos_x,
    pos_y: 0,
    pos_z: 0,
    rotation_x: 0,
    rotation_y: 0,
    rotation_z: 0,
    scale_x: 1,
    scale_y: 1,
    scale_z: 1,
  } as EntityRecord
}

function createFakeScene() {
  const scene = new Scene()
  const renderer = {
    setAnimationLoop: jest.fn(),
    setSize: jest.fn(),
    render: jest.fn(),
    dispose: jest.fn(),
    forceContextLoss: jest.fn(),
  }
  const controls = { update: jest.fn(), dispose: jest.fn() }
  const camera = new PerspectiveCamera()

  createSceneMock.mockReturnValueOnce({
    scene,
    camera,
    renderer,
    controls,
  } as unknown as ReturnType<typeof createVirtualMapScene>)

  return { scene, renderer, controls }
}

function fulfilled(scene = new Group()) {
  return { status: 'fulfilled', value: { scene } } as PromiseFulfilledResult<never>
}

function renderVirtualMap() {
  const container = document.createElement('div')
  const canvas = document.createElement('canvas')
  container.appendChild(canvas)
  const canvasRef = { current: canvas }

  return renderHook(() => useVirtualMap(canvasRef))
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('useVirtualMap', () => {
  it('starts the render loop and adds one placed model per active entity', async () => {
    const { scene, renderer } = createFakeScene()
    listActiveEntitiesMock.mockResolvedValue([
      createEntity('library-north', library, 10),
      createEntity('gym-main', gym),
      createEntity('library-south', library, -10),
    ])
    loadModelsMock.mockImplementation(async (_urls, onProgress) => {
      onProgress(50)
      onProgress(100)
      return [fulfilled(), fulfilled()]
    })

    const { result } = renderVirtualMap()

    expect(result.current.status).toBe('loading')
    expect(renderer.setAnimationLoop).toHaveBeenCalledWith(expect.any(Function))

    await waitFor(() => expect(result.current.status).toBe('ready'))

    expect(loadModelsMock).toHaveBeenCalledWith(
      ['/files/library.glb', '/files/gym.glb'],
      expect.any(Function),
    )
    expect(jest.mocked(getMeshFileUrl)).toHaveBeenCalledTimes(2)
    expect(result.current.progress).toBe(100)
    expect(scene.children.map((child) => child.position.x)).toEqual([10, -10, 0])
    expect(showMock).not.toHaveBeenCalled()
  })

  it('warns about models that failed to load and still shows the rest', async () => {
    const { scene } = createFakeScene()
    listActiveEntitiesMock.mockResolvedValue([
      createEntity('library-north', library),
      createEntity('gym-main', gym),
    ])
    loadModelsMock.mockResolvedValue([
      fulfilled(),
      { status: 'rejected', reason: new Error('Not a glTF file') },
    ])

    const { result } = renderVirtualMap()

    await waitFor(() => expect(result.current.status).toBe('ready'))

    expect(scene.children).toHaveLength(1)
    expect(showMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: messages.virtualMap.viewer.modelsFailedTitle,
        message: formatMessage(messages.virtualMap.viewer.modelsFailedMessage, '1'),
      }),
    )
  })

  it('reports a listing failure and rebuilds the scene on retry', async () => {
    const firstScene = createFakeScene()
    const requestError = new Error('Network down')
    listActiveEntitiesMock.mockRejectedValueOnce(requestError)

    const { result } = renderVirtualMap()

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.error).toBe(getRequestErrorMessage(requestError))
    expect(loadModelsMock).not.toHaveBeenCalled()

    createFakeScene()
    listActiveEntitiesMock.mockResolvedValue([])
    loadModelsMock.mockResolvedValue([])

    act(() => result.current.retry())

    expect(result.current.status).toBe('loading')
    expect(result.current.error).toBe('')
    expect(firstScene.renderer.dispose).toHaveBeenCalled()

    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(createSceneMock).toHaveBeenCalledTimes(2)
  })

  it('stops rendering and frees every GPU resource on unmount', async () => {
    const { scene, renderer, controls } = createFakeScene()
    listActiveEntitiesMock.mockResolvedValue([])
    loadModelsMock.mockResolvedValue([])

    const { result, unmount } = renderVirtualMap()
    await waitFor(() => expect(result.current.status).toBe('ready'))

    unmount()

    expect(renderer.setAnimationLoop).toHaveBeenLastCalledWith(null)
    expect(controls.dispose).toHaveBeenCalled()
    expect(disposeMock).toHaveBeenCalledWith(scene)
    expect(renderer.dispose).toHaveBeenCalled()
    expect(renderer.forceContextLoss).toHaveBeenCalled()
  })

  it('disposes a model that finishes loading after unmount instead of adding it', async () => {
    const { scene } = createFakeScene()
    let finishLoading!: (results: PromiseSettledResult<never>[]) => void
    listActiveEntitiesMock.mockResolvedValue([createEntity('library-north', library)])
    loadModelsMock.mockReturnValue(
      new Promise((resolve) => {
        finishLoading = resolve
      }),
    )

    const { unmount } = renderVirtualMap()
    await waitFor(() => expect(loadModelsMock).toHaveBeenCalled())

    unmount()
    const lateModel = new Group()
    await act(async () => finishLoading([fulfilled(lateModel)]))

    expect(disposeMock).toHaveBeenCalledWith(lateModel)
    expect(scene.children).toHaveLength(0)
  })
})
