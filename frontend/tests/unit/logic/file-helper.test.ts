import {
  buildFileRejectionNotification,
  FILE_UPLOAD_REJECTION_NOTIFICATION,
  getAcceptedMimeTypes,
  getDragStatus,
  getFileRejectionMessage,
  getFilenameFromUrl,
} from '@/helpers/file-helper.ts'
import type { FileRejection } from 'react-dropzone'

const limits = {
  maxSizeInBytes: 1000 * 1000 * 15,
  allowedMimeTypes: ['image/png', 'image/jpg', 'video/mp4'],
}

function rejection(
  fileName: string,
  code: string,
  message = 'File error',
): FileRejection {
  return {
    file: new File(['x'], fileName),
    errors: [{ code, message }],
  }
}

describe('file-helper', () => {
  describe('getFileRejectionMessage', () => {
    it('maps a file-too-large error to the size message', () => {
      expect(
        getFileRejectionMessage(rejection('big.png', 'file-too-large'), limits),
      ).toBe('"big.png" excede o tamanho máximo de 15MB.')
    })

    it('maps a file-invalid-type error to the format message', () => {
      expect(
        getFileRejectionMessage(rejection('doc.pdf', 'file-invalid-type'), limits),
      ).toBe('"doc.pdf" tem um formato não suportado.')
    })

    it('falls back to the rejection message for unknown codes', () => {
      expect(
        getFileRejectionMessage(
          rejection('x.txt', 'too-many-files', 'Too many files'),
          limits,
        ),
      ).toBe('"x.txt" — Too many files')
    })
  })

  describe('getFilenameFromUrl', () => {
    it('extracts the filename from a PocketBase file URL', () => {
      expect(
        getFilenameFromUrl('http://localhost/api/files/pbc_123/abc123/my_image.png'),
      ).toBe('my_image.png')
    })

    it('decodes URL-encoded filenames', () => {
      expect(
        getFilenameFromUrl('http://localhost/api/files/pbc_123/abc123/my%20image.png'),
      ).toBe('my image.png')
    })

    it('returns an empty string for invalid URLs', () => {
      expect(getFilenameFromUrl('not-a-url')).toBe('')
    })
  })

  describe('buildFileRejectionNotification', () => {
    it('spreads the static notification config and joins the messages', () => {
      const result = buildFileRejectionNotification(
        [
          rejection('a.png', 'file-too-large'),
          rejection('b.pdf', 'file-invalid-type'),
        ],
        limits,
      )

      expect(result).toEqual({
        ...FILE_UPLOAD_REJECTION_NOTIFICATION,
        message:
          '"a.png" excede o tamanho máximo de 15MB.\n' +
          '"b.pdf" tem um formato não suportado.',
      })
    })
  })

  describe('getAcceptedMimeTypes', () => {
    it('returns an array accept as-is', () => {
      expect(getAcceptedMimeTypes(['image/png', 'video/mp4'])).toEqual([
        'image/png',
        'video/mp4',
      ])
    })

    it('returns the MIME types (keys) of a record accept', () => {
      expect(
        getAcceptedMimeTypes({ 'model/gltf-binary': ['.glb'] }),
      ).toEqual(['model/gltf-binary'])
    })
  })

  describe('getDragStatus', () => {
    const items = (...types: string[]) =>
      types.map((type) => ({ type })) as unknown as DataTransferItemList

    it('accepts when there are no items', () => {
      expect(getDragStatus(undefined, ['image/png'])).toBe('accept')
      expect(getDragStatus(items(), ['image/png'])).toBe('accept')
    })

    it('accepts when every item type is allowed', () => {
      expect(
        getDragStatus(items('image/png', 'video/mp4'), ['image/png', 'video/mp4']),
      ).toBe('accept')
    })

    it('rejects when any item type is not allowed', () => {
      expect(
        getDragStatus(items('image/png', 'application/pdf'), ['image/png']),
      ).toBe('reject')
    })

    it('accepts items whose type is empty (e.g. .glb)', () => {
      expect(getDragStatus(items(''), ['model/gltf-binary'])).toBe('accept')
    })
  })
})
