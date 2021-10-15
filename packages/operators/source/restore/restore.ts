import { Store, createStore, Unit } from '@cometa/core';

export const restore = <T>(source: Unit<T>, initial: T): Store<T> => {
  const $store = createStore(initial);
  source.watch($store);
  return $store;
};
