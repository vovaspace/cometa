import { Event, createExecutableEvent } from '../event';
import { emitStoreCreated } from '../lifecycle';
import { createNode } from '../node';
import { Flow } from '../flow';

export interface Store<T> extends Flow<T>, Event<T> {
  store: true;
  set: (value: T) => void;
  reset: Event;
}

export type StoreValue<S> = S extends Store<infer T> ? T : never;
export type AnyStore = Store<any>;

export const createStore = <T>(initial: T): Store<T> => {
  let state = initial;

  const { watch, emit, clear } = createNode<T>();

  const store = (next: T) => next !== state && emit((state = next));

  store.store = true as const;
  store.flow = true as const;
  store.event = true as const;

  store.clear = clear;
  store.meta = {};

  store.value = () => state;
  store.watch = watch;
  store.subscribe = (subscriber: (value: T) => void) => {
    subscriber(store.value());
    return watch(subscriber);
  };

  store.set = (next: T) => store(next);
  store.reset = createExecutableEvent<void, void>(() => store(initial));

  return emitStoreCreated(store);
};

export const store = createStore;
