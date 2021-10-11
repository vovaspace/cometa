import { AnyEvent, Event, EventPayload, createEvent } from '@cometa/core';

export const combine = <U extends AnyEvent[]>(
  ...units: U
): Event<EventPayload<U[number]>> => {
  const event = createEvent<EventPayload<U[number]>>();

  units.forEach((unit) => unit.watch(event));

  return event;
};
