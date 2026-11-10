import messages from '@/constants/messages.json'
import { formatMessage } from '@/helpers/message-helper.ts'

describe('message-helper', () => {
  describe('formatMessage', () => {
    it('fills a single placeholder from a bare string', () => {
      expect(formatMessage(messages.mesh.list.editAriaLabel, 'predio_a')).toBe(
        'Editar mesh predio_a',
      )
    })

    it('fills every placeholder with the same bare string', () => {
      expect(formatMessage('{name} / {other}', 'a')).toBe('a / a')
    })

    it('substitutes a named placeholder from an object', () => {
      expect(
        formatMessage(messages.mesh.list.editAriaLabel, { name: 'predio_a' }),
      ).toBe('Editar mesh predio_a')
    })

    it('substitutes every occurrence of the same placeholder', () => {
      expect(formatMessage('{name} / {name}', { name: 'a' })).toBe('a / a')
    })

    it('keeps placeholders that were not given a value', () => {
      expect(formatMessage('{name} - {missing}', { name: 'a' })).toBe('a - {missing}')
    })

    it('returns the template untouched when it has no placeholder', () => {
      expect(formatMessage(messages.common.save, { name: 'a' })).toBe(messages.common.save)
    })
  })
})
