import { Event } from '@cometa/core';

export interface Forward {
  <T>(from: Event<T>, to: Event<T>, map?: (from: T) => T): void;
  <F, T>(from: Event<F>, to: Event<T>, map: (from: F) => T): void;
}

export const forward: Forward = <F, T>(
  from: Event<F>,
  to: Event<T>,
  map?: (from: F) => T,
): void => {
  // @ts-expect-error
  from.watch(map ? (update: F) => to(map(update)) : to);
};
