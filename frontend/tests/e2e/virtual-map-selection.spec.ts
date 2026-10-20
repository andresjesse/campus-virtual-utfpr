import { expect, test, type Page } from '@playwright/test'

import messages from '../../src/constants/messages.json' with { type: 'json' }

const mesh = {
  id: 'boxmesh0000001',
  collectionId: 'mesh_collection',
  collectionName: 'mesh',
  name: 'Box',
  file: 'box.glb',
}

const entity = {
  id: 'boxentity00001',
  collectionId: 'entities_collection',
  collectionName: 'entities',
  slug: 'main-building',
  mesh: mesh.id,
  is_active: true,
  pos_x: 0,
  pos_y: 0,
  pos_z: 0,
  rotation_x: 0,
  rotation_y: 0,
  rotation_z: 0,
  scale_x: 1,
  scale_y: 1,
  scale_z: 1,
  expand: { mesh },
}

function createBoxGltf(size: number) {
  const half = size / 2
  const positions = new Float32Array(
    [
      [-half, -half, -half],
      [half, -half, -half],
      [half, half, -half],
      [-half, half, -half],
      [-half, -half, half],
      [half, -half, half],
      [half, half, half],
      [-half, half, half],
    ].flat(),
  )
  const indices = new Uint16Array([
    0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4,
    3, 6, 2, 3, 7, 6, 0, 4, 7, 0, 7, 3, 1, 2, 6, 1, 6, 5,
  ])
  const buffer = Buffer.concat([Buffer.from(positions.buffer), Buffer.from(indices.buffer)])

  return JSON.stringify({
    asset: { version: '2.0' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, indices: 1 }] }],
    buffers: [
      {
        byteLength: buffer.byteLength,
        uri: `data:application/octet-stream;base64,${buffer.toString('base64')}`,
      },
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: positions.byteLength },
      { buffer: 0, byteOffset: positions.byteLength, byteLength: indices.byteLength },
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: 8,
        type: 'VEC3',
        min: [-half, -half, -half],
        max: [half, half, half],
      },
      { bufferView: 1, componentType: 5123, count: indices.length, type: 'SCALAR' },
    ],
  })
}

async function openMapWithOneEntity(page: Page) {
  await page.route('**/api/collections/entities/records**', (route) =>
    route.fulfill({
      json: { page: 1, perPage: 1000, totalItems: 1, totalPages: 1, items: [entity] },
    }),
  )
  await page.route(`**/api/files/**/${mesh.file}**`, (route) =>
    route.fulfill({ contentType: 'model/gltf+json', body: createBoxGltf(60) }),
  )

  await page.goto('/')

  const canvas = page.getByLabel(messages.virtualMap.viewer.canvasAriaLabel)
  await expect(canvas).toBeVisible()
  await expect(page.getByRole('status')).toBeHidden()

  const box = await canvas.boundingBox()
  if (!box) throw new Error('The map canvas has no layout box')

  return {
    center: { x: box.x + box.width / 2, y: box.y + box.height / 2 },
    emptySpot: { x: box.x + 40, y: box.y + 40 },
  }
}

const popup = (page: Page) =>
  page.getByRole('dialog', { name: messages.virtualMap.entityPopup.title })

test.describe('virtual map selection', () => {
  test('opens the entity popup on click and closes it from its close button', async ({
    page,
  }) => {
    const { center } = await openMapWithOneEntity(page)

    await page.mouse.click(center.x, center.y)

    await expect(popup(page)).toBeVisible()
    await expect(popup(page)).toContainText(entity.slug)

    await page
      .getByRole('button', { name: messages.virtualMap.entityPopup.closeAriaLabel })
      .click()

    await expect(popup(page)).toBeHidden()
  })

  test('closes the popup when clicking empty space', async ({ page }) => {
    const { center, emptySpot } = await openMapWithOneEntity(page)

    await page.mouse.click(center.x, center.y)
    await expect(popup(page)).toBeVisible()

    await page.mouse.click(emptySpot.x, emptySpot.y)

    await expect(popup(page)).toBeHidden()
  })

  test('does not select anything when dragging to orbit the camera', async ({ page }) => {
    const { center } = await openMapWithOneEntity(page)

    await page.mouse.move(center.x, center.y)
    await page.mouse.down()
    await page.mouse.move(center.x + 80, center.y + 20, { steps: 8 })
    await page.mouse.move(center.x, center.y, { steps: 8 })
    await page.mouse.up()

    await expect(popup(page)).toBeHidden()
  })
})
