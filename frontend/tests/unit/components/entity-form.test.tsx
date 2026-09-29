import { act, fireEvent, render, screen } from '@testing-library/react'

import { MantineProvider } from '@mantine/core'

import EntityForm from '@/components/entity/entity-form/EntityForm.tsx'
import { ENTITY_DEFAULT_TRANSFORM } from '@/constants/entity-constants.ts'
import messages from '@/constants/messages.json'
import { formatMessage } from '@/helpers/message-helper.ts'
import type { EntityFormValues, EntityMeshOption } from '@/types/entity.ts'

jest.mock('@mantine/notifications', () => ({ notifications: { show: jest.fn() } }))

const meshOptions: EntityMeshOption[] = [{ label: 'predio_a', value: 'mesh-a' }]

const validValues: EntityFormValues = {
  ...ENTITY_DEFAULT_TRANSFORM,
  slug: 'main-entrance',
  mesh: 'mesh-a',
  is_active: true,
}

function renderForm(
  initialValues: EntityFormValues = validValues,
  onSubmit: jest.Mock = jest.fn().mockResolvedValue(undefined),
) {
  render(
    <MantineProvider>
      <EntityForm
        initialValues={initialValues}
        meshOptions={meshOptions}
        onSubmit={onSubmit}
      />
    </MantineProvider>,
  )
  return onSubmit
}

// Required fields render their label as "Slug *", so match on the label without the asterisk.
function fieldByLabel(label: string) {
  return screen.getByLabelText(
    (content) => content.trim().replace(/\s*\*$/, '') === label,
  )
}

function slugField() {
  return fieldByLabel(messages.entities.editor.slugLabel)
}

function axisField(group: string, axis: string) {
  return fieldByLabel(
    formatMessage(messages.entities.editor.transformLabel, { group, axis }),
  )
}

function typeSlug(slug: string) {
  fireEvent.change(slugField(), { target: { value: slug } })
}

async function submit() {
  await act(async () => {
    fireEvent.submit(slugField().closest('form')!)
  })
}

describe('EntityForm', () => {
  it('blocks submission and flags the field when the slug is empty', async () => {
    const onSubmit = renderForm({ ...validValues, slug: '' })

    await submit()

    expect(onSubmit).not.toHaveBeenCalled()
    expect(slugField()).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText(messages.entities.slug.empty)).toBeInTheDocument()
  })

  it('treats a whitespace-only slug as empty', async () => {
    const onSubmit = renderForm({ ...validValues, slug: '   ' })

    await submit()

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText(messages.entities.slug.empty)).toBeInTheDocument()
  })

  it.each([['Block_A'], ['ru block'], ['_ru'], ['ru_'], ['ru__block'], ['prédio_a']])(
    'rejects the slug %s',
    async (slug) => {
      const onSubmit = renderForm({ ...validValues, slug })

      await submit()

      expect(onSubmit).not.toHaveBeenCalled()
      expect(screen.getByText(messages.entities.slug.invalid)).toBeInTheDocument()
    },
  )

  it('blocks submission when no mesh is selected', async () => {
    const onSubmit = renderForm({ ...validValues, mesh: '' })

    await submit()

    expect(onSubmit).not.toHaveBeenCalled()
    expect(
      screen.getByText(messages.entities.editor.meshRequiredError),
    ).toBeInTheDocument()
  })

  it('reports a cleared transform field instead of saving it as zero', async () => {
    const onSubmit = renderForm()
    const positionX = axisField(messages.entities.editor.groupPosition, 'X')

    fireEvent.change(positionX, { target: { value: '' } })
    await submit()

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText(messages.entities.transform.required)).toBeInTheDocument()
  })

  it('submits a complete number as a number', async () => {
    const onSubmit = renderForm()

    fireEvent.change(axisField(messages.entities.editor.groupScale, 'X'), {
      target: { value: '2.5' },
    })
    await submit()

    expect(onSubmit).toHaveBeenCalledWith({ ...validValues, scale_x: 2.5 })
  })

  it('keeps partial input as typed instead of coercing it mid-edit', async () => {
    const onSubmit = renderForm()
    const positionX = axisField(messages.entities.editor.groupPosition, 'X')

    // "-" is not a number yet; coercing here would erase the minus sign under the cursor.
    fireEvent.change(positionX, { target: { value: '-' } })

    expect(positionX).toHaveValue('-')

    fireEvent.change(positionX, { target: { value: '-2' } })
    await submit()

    expect(onSubmit).toHaveBeenCalledWith({ ...validValues, pos_x: -2 })
  })

  describe('a slug the server rejects as duplicate', () => {
    function rejectingSubmit() {
      return jest.fn().mockRejectedValue({
        status: 400,
        response: {
          status: 400,
          message: 'Failed to create record.',
          data: {
            slug: { code: 'validation_not_unique', message: 'Value must be unique.' },
          },
        },
      })
    }

    it('shows the conflict inline and blocks another request for the same slug', async () => {
      const onSubmit = renderForm(validValues, rejectingSubmit())

      await submit()

      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(screen.getByText(messages.entities.errors.duplicate)).toBeInTheDocument()

      await submit()

      expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    it('clears the conflict once the slug changes', async () => {
      const onSubmit = renderForm(validValues, rejectingSubmit())

      await submit()
      expect(screen.getByText(messages.entities.errors.duplicate)).toBeInTheDocument()

      typeSlug('side-entrance')

      expect(screen.queryByText(messages.entities.errors.duplicate)).toBeNull()

      await submit()

      expect(onSubmit).toHaveBeenCalledTimes(2)
    })

    it('does not show a field error when the failure is not about a field', async () => {
      const onSubmit = jest
        .fn()
        .mockRejectedValue({ status: 403, response: { status: 403, data: {} } })
      renderForm(validValues, onSubmit)

      await submit()

      expect(screen.queryByText(messages.entities.errors.duplicate)).toBeNull()

      // a failure it cannot attribute to the slug must not block retrying
      await submit()

      expect(onSubmit).toHaveBeenCalledTimes(2)
    })
  })
})
