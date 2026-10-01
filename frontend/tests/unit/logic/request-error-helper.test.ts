import messages from '@/constants/messages.json'
import {
  getRequestErrorKind,
  getRequestErrorMessage,
  getRequestFieldErrors,
  type RequestErrorKind,
} from '@/helpers/request-error-helper.ts'

// Exactly what PocketBase answers when the mesh.name unique index rejects a record.
const uniqueViolation = {
  status: 400,
  response: {
    status: 400,
    message: 'Failed to create record.',
    data: { name: { code: 'validation_not_unique', message: 'Value must be unique.' } },
  },
}

const hookRejection = {
  status: 400,
  response: {
    status: 400,
    message: 'A página já está vinculada a um item de menu.',
    data: {},
  },
}

const plainBadRequest = {
  status: 400,
  response: { status: 400, message: 'Failed to create record.', data: {} },
}

describe('request-error-helper', () => {
  describe('getRequestErrorKind', () => {
    it.each<[RequestErrorKind, unknown]>([
      ['duplicate', uniqueViolation],
      ['serverMessage', hookRejection],
      ['badRequest', plainBadRequest],
      ['unauthenticated', { status: 401, response: {} }],
      ['forbidden', { status: 403, response: {} }],
      ['notFound', { status: 404, response: {} }],
      ['server', { status: 503, response: {} }],
      ['network', { status: 0, response: {} }],
      ['network', new Error('Request failed')],
      ['serverMessage', new Error(messages.contentPages.editor.relationInvalidError)],
      ['generic', 'not an object'],
    ])('classifies %s', (kind, error) => {
      expect(getRequestErrorKind(error)).toBe(kind)
    })

    it('detects a unique violation on a field that is not called name', () => {
      expect(
        getRequestErrorKind({
          status: 400,
          response: {
            data: { slug: { code: 'validation_not_unique', message: 'Value must be unique.' } },
          },
        }),
      ).toBe('duplicate')
    })
  })

  describe('getRequestFieldErrors', () => {
    it('maps every field PocketBase reported', () => {
      expect(getRequestFieldErrors(uniqueViolation)).toEqual({
        name: { code: 'validation_not_unique', message: 'Value must be unique.' },
      })
    })

    it('returns nothing when the failure carries no field data', () => {
      expect(getRequestFieldErrors(plainBadRequest)).toEqual({})
      expect(getRequestFieldErrors(null)).toEqual({})
    })
  })

  describe('getRequestErrorMessage', () => {
    it('falls back to the generic catalog without a domain subtree', () => {
      expect(getRequestErrorMessage(uniqueViolation)).toBe(messages.errors.duplicate)
      expect(getRequestErrorMessage(plainBadRequest)).toBe(messages.errors.badRequest)
    })

    it('prefers the domain wording for the state it detected', () => {
      expect(getRequestErrorMessage(uniqueViolation, messages.mesh.errors)).toBe(
        messages.mesh.errors.duplicate,
      )
    })

    it('falls back per state, not per call', () => {
      expect(getRequestErrorMessage(plainBadRequest, messages.mesh.errors)).toBe(
        messages.errors.badRequest,
      )
    })

    it('shows the text of an error one of our own helpers threw', () => {
      expect(
        getRequestErrorMessage(
          new Error(messages.contentPages.editor.relationInvalidError),
        ),
      ).toBe(messages.contentPages.editor.relationInvalidError)
    })

    it('shows a pb_hooks message verbatim, domain subtree or not', () => {
      expect(getRequestErrorMessage(hookRejection, messages.mesh.errors)).toBe(
        'A página já está vinculada a um item de menu.',
      )
    })
  })

  describe('messages.json error subtrees', () => {
    const kinds: RequestErrorKind[] = [
      'duplicate',
      'serverMessage',
      'badRequest',
      'unauthenticated',
      'forbidden',
      'notFound',
      'server',
      'network',
      'generic',
    ]

    // A key outside the union would silently never be used.
    it.each(
      Object.entries(messages)
        .filter(([, domain]) => typeof domain === 'object' && 'errors' in domain)
        .map(([name, domain]) => [name, (domain as { errors: object }).errors] as const),
    )('only uses kind names in %s.errors', (_name, errorMessages) => {
      expect(kinds).toEqual(expect.arrayContaining(Object.keys(errorMessages)))
    })
  })
})
