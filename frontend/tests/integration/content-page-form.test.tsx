import { MantineProvider } from '@mantine/core'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ContentPageForm from '@/components/content-page-form/ContentPageForm.tsx'

function renderForm(onChange = jest.fn()) {
  render(
    <MantineProvider>
      <ContentPageForm
        relatedOptions={[{ label: 'Modelo 3D — bloco-a', value: 'entity:entity-a' }]}
        onChange={onChange}
      />
    </MantineProvider>,
  )

  return { onChange }
}

describe('ContentPageForm', () => {
  it('validates fields after they are touched', async () => {
    const user = userEvent.setup()
    const { onChange } = renderForm()

    await user.click(screen.getByLabelText('Título da Página'))
    await user.tab()
    await user.click(screen.getByRole('textbox', { name: 'Elemento Relacionado' }))
    await user.tab()

    expect(screen.getByLabelText('Título da Página')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(
      screen.getByRole('textbox', { name: 'Elemento Relacionado' }),
    ).toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByText('Informe o título')).not.toBeInTheDocument()
    expect(screen.queryByText('Selecione um elemento')).not.toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('emits page metadata changes for auto-save', async () => {
    const user = userEvent.setup()
    const { onChange } = renderForm()

    await user.type(screen.getByLabelText('Título da Página'), '  Bloco A  ')
    await user.click(
      screen.getByRole('textbox', { name: 'Elemento Relacionado' }),
    )
    await user.keyboard('[ArrowDown][Enter]')

    expect(onChange).toHaveBeenLastCalledWith({
      relation: 'entity:entity-a',
      title: '  Bloco A  ',
    })
  })
})
