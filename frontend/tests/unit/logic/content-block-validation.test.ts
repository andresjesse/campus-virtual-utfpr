import {
  getEmptyContentNotification,
  isBlockContentEmpty,
} from '@/helpers/content-block-validation.ts'
import { ContentPageBlocksEnum } from '@/enums/content-pages-enum.ts'
import type { FileBlockContentValue } from '@/types/content-page.ts'

describe('isBlockContentEmpty', () => {
  describe('RTF block', () => {
    it.each(['', '   ', '<p></p>', '<p><br></p>', '<p> </p>', '<p>&nbsp;</p>'])(
      'treats %j as empty',
      (content) => {
        expect(isBlockContentEmpty(ContentPageBlocksEnum.RTF_BLOCK, content)).toBe(
          true,
        )
      },
    )

    it.each(['<p>Hello</p>', 'Hello', '<p>Hello <strong>world</strong></p>'])(
      'treats %j as non-empty',
      (content) => {
        expect(isBlockContentEmpty(ContentPageBlocksEnum.RTF_BLOCK, content)).toBe(
          false,
        )
      },
    )
  })

  describe('File block', () => {
    const file = new File(['image'], 'image.png', { type: 'image/png' })

    it.each([
      ['undefined', undefined],
      ['empty string', ''],
      ['empty object', { newFiles: [], deletedUrls: [], urls: [] }],
    ])('treats %s as empty', (_, content) => {
      expect(isBlockContentEmpty(ContentPageBlocksEnum.FILE_BLOCK, content)).toBe(
        true,
      )
    })

    it('treats pending new files as non-empty', () => {
      const content: FileBlockContentValue = {
        newFiles: [file],
        deletedUrls: [],
        urls: [],
      }
      expect(isBlockContentEmpty(ContentPageBlocksEnum.FILE_BLOCK, content)).toBe(
        false,
      )
    })

    it('treats existing urls as non-empty', () => {
      const content: FileBlockContentValue = {
        newFiles: [],
        deletedUrls: [],
        urls: ['file.png'],
      }
      expect(isBlockContentEmpty(ContentPageBlocksEnum.FILE_BLOCK, content)).toBe(
        false,
      )
    })

    it('treats all urls marked for deletion as empty', () => {
      const content: FileBlockContentValue = {
        newFiles: [],
        deletedUrls: ['file.png', 'other.png'],
        urls: ['file.png', 'other.png'],
      }
      expect(isBlockContentEmpty(ContentPageBlocksEnum.FILE_BLOCK, content)).toBe(
        true,
      )
    })

    it('treats partially deleted urls as non-empty', () => {
      const content: FileBlockContentValue = {
        newFiles: [],
        deletedUrls: ['file.png'],
        urls: ['file.png', 'other.png'],
      }
      expect(isBlockContentEmpty(ContentPageBlocksEnum.FILE_BLOCK, content)).toBe(
        false,
      )
    })
  })

  describe('Diagram block', () => {
    it('skips validation', () => {
      expect(
        isBlockContentEmpty(ContentPageBlocksEnum.DIAGRAM_BLOCK, ''),
      ).toBe(false)
    })
  })
})

describe('getEmptyContentNotification', () => {
  it('returns a create message for a new RTF block', () => {
    expect(
      getEmptyContentNotification(ContentPageBlocksEnum.RTF_BLOCK, true),
    ).toEqual({
      title: 'Bloco sem conteúdo',
      message: 'É preciso adicionar conteúdo para criar um bloco.',
    })
  })

  it('returns an update message for an existing RTF block', () => {
    expect(
      getEmptyContentNotification(ContentPageBlocksEnum.RTF_BLOCK, false),
    ).toEqual({
      title: 'Bloco sem conteúdo',
      message: 'O bloco de texto não pode ficar vazio.',
    })
  })

  it('returns a create message for a new file block', () => {
    expect(
      getEmptyContentNotification(ContentPageBlocksEnum.FILE_BLOCK, true),
    ).toEqual({
      title: 'Bloco sem arquivos',
      message: 'É preciso adicionar pelo menos um arquivo para criar um bloco.',
    })
  })

  it('returns an update message for an existing file block', () => {
    expect(
      getEmptyContentNotification(ContentPageBlocksEnum.FILE_BLOCK, false),
    ).toEqual({
      title: 'Bloco sem arquivos',
      message: 'O bloco precisa ter pelo menos um arquivo.',
    })
  })
})