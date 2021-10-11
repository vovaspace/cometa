import { Event, createEvent } from '@cometa/core';

export const merge = <T>(...units: Event<T>[]): Event<T> => {
  const event = createEvent<T>();

  event.watch((payload) => {
    units.forEach((unit) => {
      unit(payload);
    });
  });

  return event;
};
