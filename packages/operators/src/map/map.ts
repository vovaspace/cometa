import { AnyEvent, Event, EventPayload, createEvent } from '@cometa/core';

export const map = <E extends AnyEvent, Payload = void>(
  event: E,
  mapper: (payload: Payload) => EventPayload<E>,
): Event<Payload> => {
  const mapped = createEvent<Payload>();

  event.watch((payload) => {
    mapped(mapper(payload));
  });

  return mapped;
};
