import { MantineProvider } from '@mantine/core'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router'

import RouteTabs, { type RouteTabOption } from '@/components/tabs/RouteTabs.tsx'

const options: RouteTabOption[] = [
  { value: 'first', label: 'First view', to: '/section/first' },
  { value: 'second', label: 'Second view', to: '/section/second' },
]

function CurrentPath() {
  return <span data-testid="path">{useLocation().pathname}</span>
}

function renderTabs(active: string, tabOptions: RouteTabOption[] = options) {
  render(
    <MantineProvider>
      <MemoryRouter initialEntries={['/section/first']}>
        <RouteTabs active={active} ariaLabel="Section views" options={tabOptions} />
        <CurrentPath />
      </MemoryRouter>
    </MantineProvider>,
  )
}

describe('RouteTabs', () => {
  it('names the tab list for screen readers', () => {
    renderTabs('first')

    expect(screen.getByRole('tablist')).toHaveAttribute('aria-label', 'Section views')
  })

  it('marks only the active option as selected', () => {
    renderTabs('first')

    expect(screen.getByRole('tab', { name: 'First view' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: 'Second view' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
  })

  it('navigates to the route of the clicked tab', () => {
    renderTabs('first')

    expect(screen.getByTestId('path')).toHaveTextContent('/section/first')

    fireEvent.click(screen.getByRole('tab', { name: 'Second view' }))

    expect(screen.getByTestId('path')).toHaveTextContent('/section/second')
  })

  it('stays put when the already active tab is clicked', () => {
    renderTabs('first')

    fireEvent.click(screen.getByRole('tab', { name: 'First view' }))

    expect(screen.getByTestId('path')).toHaveTextContent('/section/first')
  })

  it('renders one tab per option', () => {
    renderTabs('a', [
      { value: 'a', label: 'A', to: '/a' },
      { value: 'b', label: 'B', to: '/b' },
      { value: 'c', label: 'C', to: '/c' },
    ])

    expect(screen.getAllByRole('tab')).toHaveLength(3)
  })
})
