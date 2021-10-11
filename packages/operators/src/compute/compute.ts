import {
  AnyReadableStore,
  ReadableStore,
  StoreValue,
  createStore,
} from '@cometa/core';
import { toArray } from '../utilities';

type StoreValues<S> = {
  [I in keyof S]: StoreValue<S[I]>;
};

export interface Compute {
  <T, S extends AnyReadableStore>(
    store: S,
    map: (value: StoreValue<S>) => T,
  ): ReadableStore<T>;
  <T, S extends AnyReadableStore[]>(
    stores: [...S],
    map: (...values: StoreValues<S>) => T,
  ): ReadableStore<T>;
}

export const compute: Compute = <
  T,
  S extends AnyReadableStore | AnyReadableStore[],
>(
  storeOrStores: S,
  map: S extends AnyReadableStore
    ? (value: StoreValue<S>) => T
    : (
        ...values: StoreValues<S> extends unknown[] ? StoreValues<S> : never
      ) => T,
): ReadableStore<T> => {
  const stores = toArray(storeOrStores);

  const origins = new Set<AnyReadableStore>();
  for (let i = 0; i < stores.length; i += 1) {
    const store = stores[i]!;
    if (store.origins) store.origins.forEach((origin) => origins.add(origin));
    else origins.add(store);
  }

  const value = () =>
    // @ts-expect-error
    map(...stores.map((store) => store.value()));

  const computed = createStore(value());
  computed.origins = origins;

  origins.forEach((store) => store.watch(() => computed.set(value())));

  return computed;
};
