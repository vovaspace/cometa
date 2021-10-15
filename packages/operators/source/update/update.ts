import { AnyEvent, Event, EventPayload, Store } from '@cometa/core';
import { toArray } from '../utilities';

export interface Update {
  <V, E extends Event<V>>(
    event: E,
    store: Store<V>,
    reducer?: (current: V, payload: EventPayload<E>) => V,
  ): void;
  <V, E extends Event<V>>(
    event: E,
    stores: Store<V>[],
    reducer?: (current: V, payload: EventPayload<E>) => V,
  ): void;

  <V, E extends AnyEvent>(
    event: E,
    store: Store<V>,
    reducer: (current: V, payload: EventPayload<E>) => V,
  ): void;
  <V, E extends AnyEvent>(
    event: E,
    stores: Store<V>[],
    reducer: (current: V, payload: EventPayload<E>) => V,
  ): void;
}

export const update: Update = <V, E extends AnyEvent>(
  event: E,
  storeOrStores: Store<V> | Store<V>[],
  reducer?: (current: V, payload: EventPayload<E>) => V,
): void => {
  const stores = toArray(storeOrStores);

  event.watch((payload) => {
    stores.forEach((store) => {
      store.set(reducer ? reducer(store.value(), payload) : payload);
    });
  });
};
