import {
  AnyEvent,
  Event,
  EventPayload,
  ReadableStore,
  WritableStore,
} from '@cometa/core';
import { toArray } from '../utilities';

export interface Update {
  <V, E extends Event<V>>(
    event: E,
    store: ReadableStore<V> & WritableStore<V>,
    reducer?: (current: V, payload: EventPayload<E>) => V,
  ): void;
  <V, E extends Event<V>>(
    event: E,
    stores: (ReadableStore<V> & WritableStore<V>)[],
    reducer?: (current: V, payload: EventPayload<E>) => V,
  ): void;

  <V, E extends AnyEvent>(
    event: E,
    store: ReadableStore<V> & WritableStore<V>,
    reducer: (current: V, payload: EventPayload<E>) => V,
  ): void;
  <V, E extends AnyEvent>(
    event: E,
    stores: (ReadableStore<V> & WritableStore<V>)[],
    reducer: (current: V, payload: EventPayload<E>) => V,
  ): void;
}

export const update: Update = <V, E extends AnyEvent>(
  event: E,
  storeOrStores:
    | (ReadableStore<V> & WritableStore<V>)
    | (ReadableStore<V> & WritableStore<V>)[],
  reducer?: (current: V, payload: EventPayload<E>) => V,
): void => {
  const stores = toArray(storeOrStores);

  event.watch((payload) => {
    stores.forEach((store) => {
      store.set(reducer ? reducer(store.value(), payload) : payload);
    });
  });
};
