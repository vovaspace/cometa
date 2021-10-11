import { AnyReadableStore, ReadableStore, StoreValue } from '@cometa/core';
import { compute } from '../compute';

export const some = <T extends AnyReadableStore>(
  stores: T[],
  predicate: (value: StoreValue<T>) => unknown,
): ReadableStore<boolean> =>
  compute(stores, (...values) => values.some(predicate));
