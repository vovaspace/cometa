import { createNode } from '../node';
import { Unit } from '../unit';

export interface Event<Payload = void> extends Unit<Payload> {
  (payload: Payload): void;
  event: true;
  watch: (watcher: (payload: Payload) => void) => () => void;
}

export interface ExecutableEvent<Payload, Result> extends Event<Payload> {
  (payload: Payload): Result;
}

export type EventPayload<E> = E extends Event<infer P> ? P : never;

export type AnyEvent = Event<any>;

export const createExecutableEvent = <Payload, Result>(
  callback: (payload: Payload) => Result,
): ExecutableEvent<Payload, Result> => {
  const { watch, emit } = createNode<Payload>();

  const event = (payload: Payload) => {
    const result = callback(payload);
    emit(payload);
    return result;
  };

  event.event = true as const;
  event.watch = watch;

  return event;
};

export const createEvent = <Payload = void>(): Event<Payload> =>
  createExecutableEvent(() => {});

export const event = createEvent;
