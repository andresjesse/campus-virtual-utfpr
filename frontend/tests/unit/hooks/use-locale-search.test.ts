import { renderHook } from '@testing-library/react'

import { useLocaleSearch } from '@/hooks/use-locale-search.ts'

type Item = { name: string }

const items: Item[] = [{ name: 'Main Building' }, { name: 'Library' }]

describe('useLocaleSearch', () => {
  it('returns every item when the query is empty', () => {
    const { result } = renderHook(() => useLocaleSearch(items, '', (item) => item.name))

    expect(result.current).toEqual(items)
  })

  it('returns every item when the query is whitespace-only', () => {
    const { result } = renderHook(() => useLocaleSearch(items, '   ', (item) => item.name))

    expect(result.current).toEqual(items)
  })

  it('filters case-insensitively by the given field', () => {
    const { result } = renderHook(() => useLocaleSearch(items, 'LIBRA', (item) => item.name))

    expect(result.current).toEqual([{ name: 'Library' }])
  })

  it('returns an empty array when nothing matches', () => {
    const { result } = renderHook(() => useLocaleSearch(items, 'zzz', (item) => item.name))

    expect(result.current).toEqual([])
  })
})
