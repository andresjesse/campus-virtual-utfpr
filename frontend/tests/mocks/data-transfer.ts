export function createDataTransfer(initialData: Record<string, string> = {}) {
  const data = { ...initialData }

  return {
    get types() {
      return Object.keys(data)
    },
    setData: jest.fn((type: string, value: string) => {
      data[type] = value
    }),
    getData: (type: string) => data[type] ?? '',
    effectAllowed: 'uninitialized',
    dropEffect: 'none',
  }
}
