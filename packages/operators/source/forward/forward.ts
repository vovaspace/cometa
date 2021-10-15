import { Event, Unit } from '@cometa/core';

export interface Forward {
  <F, T extends F>(from: Unit<F>, to: Event<T>, map?: (from: F) => T): void;
  <F, T>(from: Unit<F>, to: Event<T>, map: (from: F) => T): void;
}

export const forward: Forward = (
  from: Unit<unknown>,
  to: Event<unknown>,
  map?: (from: unknown) => unknown,
): void => {
  from.watch(map ? (update) => to(map(update)) : to);
};
