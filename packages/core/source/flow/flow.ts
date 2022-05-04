import { createHost } from '../host';
import { Unit } from '../unit';
import { createNode } from '../node';

export interface FlowMeta {
  [key: string]: unknown;
}

export interface Flow<T> extends Unit<T> {
  flow: true;
  meta: FlowMeta;
  value: () => T;
  watch: (watcher: (value: T) => void) => () => void;
  subscribe: (subscriber: (value: T) => void) => () => void;
}

export type FlowValue<F> = F extends Flow<infer T> ? T : never;
export type AnyFlow = Flow<any>;

const noop = () => {};

export const createFlow = <T>(
  reader: () => T,
  notifier?: (set: (next: T) => void) => void,
): Flow<T> => {
  let state = reader();
  let active = false;

  const { enter, exit, clear } = createHost();
  const { emit, inn, out, watch } = createNode<T>();

  const set = (next: T) => next !== state && emit((state = next));

  const value = () => {
    if (active) return state;
    set(reader());
    return state;
  };

  const init = notifier
    ? () => {
        enter();
        notifier(set);
        active = true;
        exit();
      }
    : noop;

  inn(init);
  out(() => {
    active = false;
    clear();
  });

  const flow = {
    flow: true as const,
    meta: {},
    value,
    watch,
    subscribe: (subscriber: (value: T) => void) => {
      subscriber(value());
      return watch(subscriber);
    },
  } as Flow<T>;

  return flow;
};

export const flow = createFlow;
