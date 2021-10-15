import { AnyEvent, Event, EventPayload, createEvent } from '@cometa/core';

export const prepend = <E extends AnyEvent, Payload = void>(
  event: E,
  prepender: (payload: Payload) => EventPayload<E>,
): Event<Payload> => {
  const prepended = createEvent<Payload>();

  prepended.watch((payload) => event(prepender(payload)));

  return prepended;
};
