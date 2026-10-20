export type EventCallback<Data> = (data: Data) => void;

export type EventBus<Events extends Record<string, unknown>> = {
  register<Event extends keyof Events>(
    event: Event,
    callback: EventCallback<Events[Event]>,
  ): () => void;
  unregister<Event extends keyof Events>(
    event: Event,
    callback: EventCallback<Events[Event]>,
  ): void;
  dispatch<Event extends keyof Events>(event: Event, data: Events[Event]): void;
};
