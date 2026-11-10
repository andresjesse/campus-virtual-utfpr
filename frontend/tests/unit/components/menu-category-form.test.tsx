import { act, fireEvent, render, screen } from '@testing-library/react'

import { MantineProvider } from '@mantine/core'

import MenuCategoryForm from '@/components/menu/menu-category-form/MenuCategoryForm.tsx'
import messages from '@/constants/messages.json'
import type { MenuCategoryFormValues } from '@/types/menu.ts'

jest.mock('@mantine/notifications', () => ({ notifications: { show: jest.fn() } }))

function renderForm(
  initialValues: MenuCategoryFormValues = { label: '' },
  onSubmit: jest.Mock = jest.fn().mockResolvedValue(undefined),
) {
  render(
    <MantineProvider>
      <MenuCategoryForm initialValues={initialValues} onSubmit={onSubmit} />
    </MantineProvider>,
  )
  return onSubmit
}

function labelField() {
  return screen.getByLabelText(
    (content) =>
      content.trim().replace(/\s*\*$/, '') ===
      messages.menuCategories.editor.labelLabel,
  )
}

function typeLabel(label: string) {
  fireEvent.change(labelField(), { target: { value: label } })
}

async function submit() {
  await act(async () => {
    fireEvent.submit(labelField().closest('form')!)
  })
}

describe('MenuCategoryForm', () => {
  it('blocks submission and flags the field when the label is empty', async () => {
    const onSubmit = renderForm()

    await submit()

    expect(onSubmit).not.toHaveBeenCalled()
    expect(labelField()).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText(messages.menuCategories.label.empty)).toBeInTheDocument()
  })

  it('treats a whitespace-only label as empty', async () => {
    const onSubmit = renderForm({ label: '   ' })

    await submit()

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText(messages.menuCategories.label.empty)).toBeInTheDocument()
  })

  it('reports the empty label once the field is blurred, before any submit', () => {
    renderForm()

    expect(screen.queryByText(messages.menuCategories.label.empty)).toBeNull()

    fireEvent.blur(labelField())

    expect(screen.getByText(messages.menuCategories.label.empty)).toBeInTheDocument()
  })

  it('submits the typed label', async () => {
    const onSubmit = renderForm()

    typeLabel('Social Media')
    await submit()

    expect(onSubmit).toHaveBeenCalledWith({ label: 'Social Media' })
  })

  describe('a label the server rejects as duplicate', () => {
    const takenValues: MenuCategoryFormValues = { label: 'General' }

    function rejectingSubmit() {
      return jest.fn().mockRejectedValue({
        status: 400,
        response: {
          status: 400,
          message: 'Failed to create record.',
          data: {
            label: { code: 'validation_not_unique', message: 'Value must be unique.' },
          },
        },
      })
    }

    it('shows the conflict inline and blocks another request for the same label', async () => {
      const onSubmit = renderForm(takenValues, rejectingSubmit())

      await submit()

      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(
        screen.getByText(messages.menuCategories.errors.duplicate),
      ).toBeInTheDocument()

      await submit()

      expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    it('clears the conflict once the label changes', async () => {
      const onSubmit = renderForm(takenValues, rejectingSubmit())

      await submit()
      expect(
        screen.getByText(messages.menuCategories.errors.duplicate),
      ).toBeInTheDocument()

      typeLabel('General 2')

      expect(screen.queryByText(messages.menuCategories.errors.duplicate)).toBeNull()

      await submit()

      expect(onSubmit).toHaveBeenCalledTimes(2)
    })

    it('does not show a field error when the failure is not about a field', async () => {
      const onSubmit = jest
        .fn()
        .mockRejectedValue({ status: 403, response: { status: 403, data: {} } })
      renderForm(takenValues, onSubmit)

      await submit()

      expect(screen.queryByText(messages.menuCategories.errors.duplicate)).toBeNull()

      await submit()

      expect(onSubmit).toHaveBeenCalledTimes(2)
    })
  })
})
