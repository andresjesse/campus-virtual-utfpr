import { createEventBus } from '@/helpers/event-bus.ts'

type TestEvents = {
  selected: { id: string }
  cleared: undefined
}

describe('createEventBus', () => {
  it('delivers the dispatched payload to a registered listener', () => {
    const bus = createEventBus<TestEvents>()
    const listener = jest.fn()

    bus.register('selected', listener)
    bus.dispatch('selected', { id: 'entity-1' })

    expect(listener).toHaveBeenCalledWith({ id: 'entity-1' })
  })

  it('delivers to every listener of the event and to no other event', () => {
    const bus = createEventBus<TestEvents>()
    const first = jest.fn()
    const second = jest.fn()
    const other = jest.fn()

    bus.register('selected', first)
    bus.register('selected', second)
    bus.register('cleared', other)
    bus.dispatch('selected', { id: 'entity-1' })

    expect(first).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenCalledTimes(1)
    expect(other).not.toHaveBeenCalled()
  })

  it('stops delivering after unregister', () => {
    const bus = createEventBus<TestEvents>()
    const listener = jest.fn()

    bus.register('cleared', listener)
    bus.unregister('cleared', listener)
    bus.dispatch('cleared')

    expect(listener).not.toHaveBeenCalled()
  })

  it('stops delivering after calling the function returned by register', () => {
    const bus = createEventBus<TestEvents>()
    const listener = jest.fn()

    const unregister = bus.register('cleared', listener)
    unregister()
    bus.dispatch('cleared')

    expect(listener).not.toHaveBeenCalled()
  })

  it('ignores a dispatch with no listeners and an unregister of an unknown listener', () => {
    const bus = createEventBus<TestEvents>()

    expect(() => {
      bus.dispatch('cleared')
      bus.unregister('cleared', jest.fn())
    }).not.toThrow()
  })

  it('still notifies the remaining listeners when one unregisters itself during dispatch', () => {
    const bus = createEventBus<TestEvents>()
    const second = jest.fn()
    const unregisterFirst = bus.register('cleared', () => unregisterFirst())
    bus.register('cleared', second)

    bus.dispatch('cleared')
    bus.dispatch('cleared')

    expect(second).toHaveBeenCalledTimes(2)
  })
})
