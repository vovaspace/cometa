import { AnyUnit, UnitType, Event, createEvent } from '@cometa/core';

export const map = <U extends AnyUnit, Payload = void>(
  unit: U,
  mapper: (payload: Payload) => UnitType<U>,
): Event<Payload> => {
  const mapped = createEvent<Payload>();

  unit.watch((update) => {
    mapped(mapper(update));
  });

  return mapped;
};
