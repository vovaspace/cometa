import { Event, createExecutableEvent } from '../event';
import { emitStoreCreated } from '../lifecycle';
import { createNode } from '../node';
import { Unit } from '../unit';

export interface ReadableStore<T> extends Unit<T> {
  store: true;
  origins?: Set<AnyReadableStore>;
  value: () => T;
  subscribe: (subscriber: (update: T) => void) => () => void;
}

export type StoreValue<S> = S extends ReadableStore<infer T> ? T : never;
export type AnyReadableStore = ReadableStore<any>;

export interface WritableStore<T> extends Event<T> {
  set: (value: T) => void;
  reset: Event;
}

export type AnyWritableStore = WritableStore<any>;

export const createStore = <T>(
  initial: T,
): ReadableStore<T> & WritableStore<T> => {
  let value = initial;

  const { watch, emit, clear, done } = createNode<T>();

  const store = (next: T) => next !== value && emit((value = next));

  store.cometa = true as const;
  store.store = true as const;
  store.event = true as const;

  store.clear = clear;

  store.value = () => value;
  store.watch = watch;
  store.subscribe = (subscriber: (update: T) => void) => {
    subscriber(value);
    return store.watch(subscriber);
  };

  store.set = (next: T) => store(next);
  store.reset = createExecutableEvent<void, void>(() => store(initial));

  done();

  return emitStoreCreated<ReadableStore<T> & WritableStore<T>>(store);
};

export const store = createStore;
