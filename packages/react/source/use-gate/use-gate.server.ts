import { wait, Event, AnyEvent } from '@cometa/core';

interface Meta {
  done: boolean;
  promise: Promise<unknown> | null;
}

const cache = new Map<AnyEvent, Meta>();

export const useGate = <Payload>(event: Event<Payload>, payload: Payload) => {
  let meta = cache.get(event);

  if (meta === undefined)
    cache.set(event, (meta = { done: false, promise: null }));

  if (meta.done) return cache.delete(event);
  // eslint-disable-next-line @typescript-eslint/no-throw-literal
  if (meta.promise) throw meta.promise;

  meta.promise = wait(() => event(payload)).then(() => {
    meta!.done = true;
    meta!.promise = null;
  });

  // eslint-disable-next-line @typescript-eslint/no-throw-literal
  throw meta.promise;
};
