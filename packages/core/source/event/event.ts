import { lifecycle } from '../lifecycle';
import { createNode } from '../node';
import { Unit } from '../unit';

export interface EventMeta {
  [key: string]: unknown;
}

export interface Event<Payload = void> extends Unit<Payload> {
  (payload: Payload): void;
  event: true;
  meta: EventMeta;
  watch: (watcher: (payload: Payload) => void) => () => void;
}

export interface ExoticExecutableEvent<Payload, Result> extends Event<Payload> {
  (payload: Payload): Result;
}

export type EventPayload<E> = E extends Event<infer P> ? P : never;

export type AnyEvent = Event<any>;

export const createExoticExecutableEvent = <Payload, Result>(
  callback: (payload: Payload) => Result,
): ExoticExecutableEvent<Payload, Result> => {
  const { watch, emit } = createNode<Payload>();

  const event = (payload: Payload) => {
    const result = callback(payload);
    emit(payload);
    return result;
  };

  event.event = true as const;
  event.meta = {};
  event.watch = watch;

  return lifecycle.event.created.emit(event);
};

const noop = () => {};

export const createEvent = <Payload = void>(): Event<Payload> =>
  createExoticExecutableEvent(noop);

export const event = createEvent;
