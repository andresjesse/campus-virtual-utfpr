import { getMeshFileUrl } from '@/services/mesh-service.ts'
import type { MeshRecord } from '@/types/mesh.ts'

const mockGetURL = jest.fn()

jest.mock('@/services/pocketbase.ts', () => ({
  pocketbase: {
    files: { getURL: (...args: unknown[]) => mockGetURL(...args) },
  },
}))

describe('mesh service', () => {
  it('builds the download URL of the mesh file', () => {
    const mesh = { id: 'mesh-id', file: 'main_building.glb' } as MeshRecord
    mockGetURL.mockReturnValue('http://localhost/api/files/mesh/mesh-id/main_building.glb')

    expect(getMeshFileUrl(mesh)).toBe(
      'http://localhost/api/files/mesh/mesh-id/main_building.glb',
    )
    expect(mockGetURL).toHaveBeenCalledWith(mesh, 'main_building.glb')
  })
})
