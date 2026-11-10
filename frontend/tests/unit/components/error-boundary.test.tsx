import { render, screen } from '@testing-library/react'

import ErrorBoundary from '@/components/error-boundary/ErrorBoundary.tsx'

function Broken(): never {
  throw new Error('Render failed')
}

describe('ErrorBoundary', () => {
  it('renders its children when nothing fails', () => {
    render(
      <ErrorBoundary fallback={<p>Fallback</p>}>
        <p>Content</p>
      </ErrorBoundary>,
    )

    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.queryByText('Fallback')).not.toBeInTheDocument()
  })

  it('renders the fallback when a child throws', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary fallback={<p>Fallback</p>}>
        <Broken />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Fallback')).toBeInTheDocument()
  })
})
