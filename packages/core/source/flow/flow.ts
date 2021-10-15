import { emitFlowCreated } from '../lifecycle';
import { createNode } from '../node';
import { Unit } from '../unit';

export interface Flow<T> extends Unit<T> {
  flow: true;
  meta: Record<string | number | symbol, unknown>;
  value: () => T;
  watch: (watcher: (value: T) => void) => () => void;
  subscribe: (subscriber: (value: T) => void) => () => void;
}

export type FlowValue<F> = F extends Flow<infer T> ? T : never;
export type AnyFlow = Flow<any>;

export const createFlow = <T>(
  reader: () => T,
  notifier?: (set: (next: T) => void) => void,
  hot: boolean = false,
): Flow<T> => {
  let state = reader();
  let active = hot;

  const { watch, emit, clear, inn, out, enter, exit } = createNode<T>();

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
    : () => {};

  if (hot) init();
  else {
    inn(init);
    out(() => {
      active = false;
      clear();
    });
  }

  return emitFlowCreated({
    flow: true as const,
    meta: {},
    value,
    watch,
    subscribe: (subscriber: (value: T) => void) => {
      subscriber(value());
      return watch(subscriber);
    },
  });
};

export const flow = createFlow;
