import type { EventBus, EventCallback } from "@/types/event-bus.ts";

export function createEventBus<Events extends Record<string, unknown>>(): EventBus<Events> {
  const listeners = new Map<keyof Events, Set<EventCallback<never>>>();

  const unregister = <Event extends keyof Events>(
    event: Event,
    callback: EventCallback<Events[Event]>,
  ) => {
    const callbacks = listeners.get(event);
    if (!callbacks) return;

    callbacks.delete(callback);
    if (callbacks.size === 0) listeners.delete(event);
  };

  return {
    register(event, callback) {
      const callbacks = listeners.get(event) ?? new Set();
      callbacks.add(callback);
      listeners.set(event, callbacks);

      return () => unregister(event, callback);
    },
    unregister,
    dispatch(event, data) {
      const callbacks = listeners.get(event);
      if (!callbacks) return;

      [...callbacks].forEach((callback) => (callback as EventCallback<typeof data>)(data));
    },
  };
}
