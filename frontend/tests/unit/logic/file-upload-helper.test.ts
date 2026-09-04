import {
  buildFileRejectionNotification,
  FILE_UPLOAD_REJECTION_NOTIFICATION,
  getFileRejectionMessage,
  getFilenameFromUrl,
} from '@/helpers/file-upload-helper.ts'
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

describe('file-upload-helper', () => {
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
})