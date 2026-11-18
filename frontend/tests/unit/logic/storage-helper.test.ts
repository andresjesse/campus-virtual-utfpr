import { readStorageItem, writeStorageItem } from '@/helpers/storage-helper.ts'

function createThrowingStorage(): Storage {
  return {
    length: 0,
    clear: jest.fn(),
    key: jest.fn(),
    removeItem: jest.fn(),
    getItem: jest.fn(() => {
      throw new Error('storage disabled')
    }),
    setItem: jest.fn(() => {
      throw new Error('storage disabled')
    }),
  }
}

describe('storage helper', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('writes and reads back a value', () => {
    writeStorageItem('sample-key', 'sample-value')

    expect(readStorageItem('sample-key')).toBe('sample-value')
  })

  it('returns null for a missing key', () => {
    expect(readStorageItem('missing-key')).toBeNull()
  })

  it('returns null when storage cannot be read', () => {
    expect(readStorageItem('sample-key', createThrowingStorage())).toBeNull()
  })

  it('ignores a write when storage is blocked', () => {
    expect(() => writeStorageItem('sample-key', 'sample-value', createThrowingStorage())).not.toThrow()
  })
})
