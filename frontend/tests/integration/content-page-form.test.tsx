import { MantineProvider } from '@mantine/core'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'

import ContentPageForm from '@/components/content-page/content-page-form/ContentPageForm.tsx'
import messages from '@/constants/messages.json'

jest.mock('@/components/content-page/content-page-form/BlocksList.tsx', () => ({
  __esModule: true,
  default: ({ children }: { children?: ReactNode }) => children,
}))

function renderForm(onSubmit = jest.fn().mockResolvedValue(undefined)) {
  render(
    <MantineProvider>
      <ContentPageForm
        initialValues={{ relation: '', title: '' }}
        relatedOptions={[{ label: '3D Model — block-a', value: 'entity:entity-a' }]}
        onSubmit={onSubmit}
      />
    </MantineProvider>,
  )

  return { onSubmit }
}

const titleLabel = messages.contentPages.editor.titleLabel
const relationLabel = messages.contentPages.editor.relationLabel

describe('ContentPageForm', () => {
  it('validates fields after they are touched', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    await user.click(screen.getByLabelText(titleLabel, { exact: false }))
    await user.tab()
    await user.click(screen.getByRole('combobox', { name: new RegExp(relationLabel) }))
    await user.tab()

    expect(screen.getByLabelText(titleLabel, { exact: false })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(
      screen.getByRole('combobox', { name: new RegExp(relationLabel) }),
    ).toHaveAttribute('aria-invalid', 'true')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('refuses to submit an incomplete page and shows what is missing', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    await user.click(screen.getByRole('button', { name: messages.common.save }))

    expect(
      screen.getByText(messages.contentPages.editor.titleRequiredError),
    ).toBeInTheDocument()
    expect(
      screen.getByText(messages.contentPages.editor.relationRequiredError),
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits the trimmed page metadata', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    await user.type(screen.getByLabelText(titleLabel, { exact: false }), '  Block A  ')
    await user.click(screen.getByRole('combobox', { name: new RegExp(relationLabel) }))
    await user.keyboard('[ArrowDown][Enter]')
    await user.click(screen.getByRole('button', { name: messages.common.save }))

    expect(onSubmit).toHaveBeenCalledWith({
      relation: 'entity:entity-a',
      title: 'Block A',
    })
  })
})
