import { createExoticExecutableEvent, Event, EventMeta } from '../event';
import { Flow, FlowMeta } from '../flow';
import { lifecycle } from '../lifecycle';
import { createNode } from '../node';

export interface StoreMeta extends FlowMeta, EventMeta {}

export interface Store<T> extends Flow<T>, Event<T> {
  store: true;
  meta: StoreMeta;
  set: (value: T) => void;
  reset: Event;
}

export type StoreValue<S> = S extends Store<infer T> ? T : never;
export type AnyStore = Store<any>;

export const createStore = <T>(initial: T): Store<T> => {
  let state = initial;

  const { watch, emit } = createNode<T>();

  const store: Store<T> = (next: T) => next !== state && emit((state = next));

  store.store = true as const;
  store.flow = true as const;
  store.event = true as const;

  store.meta = {};
  store.watch = watch;

  store.value = () => state;

  store.set = (next: T) => store(next);

  store.reset = createExoticExecutableEvent<void, void>(() => store(initial));

  store.subscribe = (subscriber: (value: T) => void) => {
    subscriber(store.value());
    return watch(subscriber);
  };

  return lifecycle.store.created.emit(store);
};

export const store = createStore;
