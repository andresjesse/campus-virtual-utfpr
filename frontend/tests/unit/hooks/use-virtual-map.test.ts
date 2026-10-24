import { notifications } from '@mantine/notifications'
import { act, fireEvent, renderHook, waitFor } from '@testing-library/react'
import { Group, PerspectiveCamera, Scene } from 'three'

import messages from '@/constants/messages.json'
import { VIRTUAL_MAP_EVENTS } from '@/constants/virtual-map-constants.ts'
import { formatMessage } from '@/helpers/message-helper.ts'
import { getRequestErrorMessage } from '@/helpers/request-error-helper.ts'
import { virtualMapEventBus } from '@/helpers/virtual-map-event-bus.ts'
import {
  applyEntityHighlight,
  createVirtualMapScene,
  disposeObject3D,
  loadModels,
  pickEntity,
  pickEntityRoot,
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
  applyEntityHighlight: jest.fn(),
  createVirtualMapScene: jest.fn(),
  disposeObject3D: jest.fn(),
  loadModels: jest.fn(),
  pickEntity: jest.fn(),
  pickEntityRoot: jest.fn(),
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
const pickEntityMock = jest.mocked(pickEntity)
const pickEntityRootMock = jest.mocked(pickEntityRoot)
const applyHighlightMock = jest.mocked(applyEntityHighlight)
const listActiveEntitiesMock = jest.mocked(listActiveEntities)
const showMock = jest.mocked(notifications.show)

const library = { id: 'library', file: 'library.glb' } as MeshRecord
const gym = { id: 'gym', file: 'gym.glb' } as MeshRecord

function createEntity(id: string, mesh: MeshRecord, pos_x = 0): EntityRecord {
  return {
    id,
    slug: id,
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

  return { canvas, ...renderHook(() => useVirtualMap(canvasRef)) }
}

function click(canvas: HTMLCanvasElement, from = { clientX: 10, clientY: 10 }, to = from) {
  fireEvent.pointerDown(canvas, { button: 0, ...from })
  fireEvent.pointerUp(canvas, { button: 0, ...to })
}

function hover(canvas: HTMLCanvasElement, renderer: ReturnType<typeof createFakeScene>['renderer']) {
  fireEvent.pointerMove(canvas, { pointerType: 'mouse', buttons: 0, clientX: 10, clientY: 10 })
  const frame = renderer.setAnimationLoop.mock.calls[0][0] as () => void
  act(() => frame())
}

function listenToSelection() {
  const selected = jest.fn()
  const cleared = jest.fn()
  const unregisterSelected = virtualMapEventBus.register(VIRTUAL_MAP_EVENTS.ENTITY_SELECTED, selected)
  const unregisterCleared = virtualMapEventBus.register(VIRTUAL_MAP_EVENTS.SELECTION_CLEARED, cleared)
  afterEachCleanups.push(unregisterSelected, unregisterCleared)

  return { selected, cleared }
}

const afterEachCleanups: (() => void)[] = []

afterEach(() => {
  afterEachCleanups.splice(0).forEach((cleanup) => cleanup())
})

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

  it('dispatches ENTITY_SELECTED with the entity under a click', async () => {
    const { scene } = createFakeScene()
    listActiveEntitiesMock.mockResolvedValue([createEntity('library-north', library)])
    loadModelsMock.mockResolvedValue([fulfilled()])
    pickEntityMock.mockReturnValue({ id: 'library-north', slug: 'library-north' })
    const { selected, cleared } = listenToSelection()

    const { canvas, result } = renderVirtualMap()
    await waitFor(() => expect(result.current.status).toBe('ready'))

    click(canvas)

    expect(scene.children[0].userData.entity).toEqual({
      id: 'library-north',
      slug: 'library-north',
    })
    expect(pickEntityMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      [scene.children[0]],
    )
    expect(selected).toHaveBeenCalledWith({ id: 'library-north', slug: 'library-north' })
    expect(cleared).not.toHaveBeenCalled()
  })

  it('dispatches SELECTION_CLEARED when a click hits no entity', async () => {
    createFakeScene()
    listActiveEntitiesMock.mockResolvedValue([])
    loadModelsMock.mockResolvedValue([])
    pickEntityMock.mockReturnValue(null)
    const { selected, cleared } = listenToSelection()

    const { canvas, result } = renderVirtualMap()
    await waitFor(() => expect(result.current.status).toBe('ready'))

    click(canvas)

    expect(cleared).toHaveBeenCalledTimes(1)
    expect(selected).not.toHaveBeenCalled()
  })

  it('ignores an orbit drag and a non-primary button', async () => {
    createFakeScene()
    listActiveEntitiesMock.mockResolvedValue([])
    loadModelsMock.mockResolvedValue([])
    const { selected, cleared } = listenToSelection()

    const { canvas, result } = renderVirtualMap()
    await waitFor(() => expect(result.current.status).toBe('ready'))

    click(canvas, { clientX: 10, clientY: 10 }, { clientX: 80, clientY: 10 })
    fireEvent.pointerDown(canvas, { button: 2, clientX: 10, clientY: 10 })
    fireEvent.pointerUp(canvas, { button: 2, clientX: 10, clientY: 10 })

    expect(pickEntityMock).not.toHaveBeenCalled()
    expect(selected).not.toHaveBeenCalled()
    expect(cleared).not.toHaveBeenCalled()
  })

  it('ignores an orbit drag that ends back where it started', async () => {
    createFakeScene()
    listActiveEntitiesMock.mockResolvedValue([])
    loadModelsMock.mockResolvedValue([])
    const { selected, cleared } = listenToSelection()

    const { canvas, result } = renderVirtualMap()
    await waitFor(() => expect(result.current.status).toBe('ready'))

    fireEvent.pointerDown(canvas, { button: 0, clientX: 10, clientY: 10 })
    fireEvent.pointerMove(canvas, { clientX: 80, clientY: 10 })
    fireEvent.pointerUp(canvas, { button: 0, clientX: 10, clientY: 10 })

    expect(pickEntityMock).not.toHaveBeenCalled()
    expect(selected).not.toHaveBeenCalled()
    expect(cleared).not.toHaveBeenCalled()
  })

  it('stops listening to the canvas on unmount', async () => {
    createFakeScene()
    listActiveEntitiesMock.mockResolvedValue([])
    loadModelsMock.mockResolvedValue([])
    const { cleared } = listenToSelection()

    const { canvas, result, unmount } = renderVirtualMap()
    await waitFor(() => expect(result.current.status).toBe('ready'))

    unmount()
    click(canvas)

    expect(cleared).not.toHaveBeenCalled()
  })

  describe('hover highlight', () => {
    async function renderReady() {
      const fake = createFakeScene()
      listActiveEntitiesMock.mockResolvedValue([createEntity('library-north', library)])
      loadModelsMock.mockResolvedValue([fulfilled()])
      const restore = jest.fn()
      applyHighlightMock.mockReturnValue(restore)

      const view = renderVirtualMap()
      await waitFor(() => expect(view.result.current.status).toBe('ready'))

      return { ...fake, ...view, restore }
    }

    it('highlights the entity under the pointer and shows a pointer cursor', async () => {
      const { scene, canvas, renderer } = await renderReady()
      pickEntityRootMock.mockReturnValue(scene.children[0])

      hover(canvas, renderer)

      expect(applyHighlightMock).toHaveBeenCalledWith(
        scene.children[0],
        expect.any(String),
        expect.any(Number),
      )
      expect(canvas.style.cursor).toBe('pointer')
    })

    it('only raycasts on the next frame, not on every pointer move', async () => {
      const { scene, canvas } = await renderReady()
      pickEntityRootMock.mockReturnValue(scene.children[0])

      fireEvent.pointerMove(canvas, { pointerType: 'mouse', buttons: 0, clientX: 10, clientY: 10 })
      fireEvent.pointerMove(canvas, { pointerType: 'mouse', buttons: 0, clientX: 12, clientY: 10 })

      expect(pickEntityRootMock).not.toHaveBeenCalled()
    })

    it('restores the highlight when the pointer moves onto empty space', async () => {
      const { scene, canvas, renderer, restore } = await renderReady()
      pickEntityRootMock.mockReturnValueOnce(scene.children[0])
      hover(canvas, renderer)

      pickEntityRootMock.mockReturnValueOnce(null)
      hover(canvas, renderer)

      expect(restore).toHaveBeenCalledTimes(1)
      expect(canvas.style.cursor).toBe('')
    })

    it('does not highlight the same entity twice while the pointer stays on it', async () => {
      const { scene, canvas, renderer } = await renderReady()
      pickEntityRootMock.mockReturnValue(scene.children[0])

      hover(canvas, renderer)
      hover(canvas, renderer)

      expect(applyHighlightMock).toHaveBeenCalledTimes(1)
    })

    it('clears the highlight when a button is pressed or the pointer leaves', async () => {
      const { scene, canvas, renderer, restore } = await renderReady()
      pickEntityRootMock.mockReturnValue(scene.children[0])
      hover(canvas, renderer)

      fireEvent.pointerDown(canvas, { button: 0, clientX: 10, clientY: 10 })
      expect(restore).toHaveBeenCalledTimes(1)
      expect(canvas.style.cursor).toBe('')

      hover(canvas, renderer)
      fireEvent.pointerLeave(canvas)
      expect(restore).toHaveBeenCalledTimes(2)
    })

    it('ignores touch pointers and moves with a button held', async () => {
      const { canvas, renderer } = await renderReady()
      const frame = renderer.setAnimationLoop.mock.calls[0][0] as () => void

      fireEvent.pointerMove(canvas, { pointerType: 'touch', buttons: 0, clientX: 10, clientY: 10 })
      fireEvent.pointerMove(canvas, { pointerType: 'mouse', buttons: 1, clientX: 10, clientY: 10 })
      act(() => frame())

      expect(pickEntityRootMock).not.toHaveBeenCalled()
    })

    it('restores the highlight before disposing the scene on unmount', async () => {
      const { scene, canvas, renderer, restore, unmount } = await renderReady()
      pickEntityRootMock.mockReturnValue(scene.children[0])
      hover(canvas, renderer)

      unmount()

      expect(restore).toHaveBeenCalledTimes(1)
      expect(restore.mock.invocationCallOrder[0]).toBeLessThan(
        disposeMock.mock.invocationCallOrder[0],
      )
    })
  })
})
