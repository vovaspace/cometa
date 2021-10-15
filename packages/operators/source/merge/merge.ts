import { Event, createEvent } from '@cometa/core';

export const merge = <T>(...units: Event<T>[]): Event<T> => {
  const merged = createEvent<T>();

  merged.watch((payload) => units.forEach((unit) => unit(payload)));

  return merged;
};
