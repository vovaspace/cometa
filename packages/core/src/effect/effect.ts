import {
  Event,
  ExecutableEvent,
  createEvent,
  createExecutableEvent,
} from '../event';
import { emitQueueMessage } from '../lifecycle';
import { createNode } from '../node';

export interface EffectFulfilledPayload<Payload, Result> {
  payload: Payload;
  result: Result;
}

export interface EffectRejectedPayload<Payload, Err> {
  payload: Payload;
  error: Err;
}

export type EffectSettledPayload<Payload, Result, Err> =
  | (EffectFulfilledPayload<Payload, Result> & { status: 'fulfilled' })
  | (EffectRejectedPayload<Payload, Err> & { status: 'rejected' });

export interface Effect<Payload = void, Result = unknown, Err = Error>
  extends ExecutableEvent<Payload, Promise<Result>> {
  effect: true;
  settled: Event<EffectSettledPayload<Payload, Result, Err>>;
  fulfilled: Event<EffectFulfilledPayload<Payload, Result>>;
  rejected: Event<EffectRejectedPayload<Payload, Err>>;
  done: Event<Result>;
  failed: Event<Err>;
}

export type AnyEffect = Effect<any, any, any>;

export type EffectPayload<Fx> = Fx extends Effect<infer P, any, any>
  ? P
  : never;
export type EffectResult<Fx> = Fx extends Effect<any, infer R, any> ? R : never;
export type EffectError<Fx> = Fx extends Effect<any, any, infer E> ? E : never;

export const createEffect = <Payload = void, Result = unknown, Err = Error>(
  handler: (payload: Payload) => Result | Promise<Result>,
): Effect<Payload, Result, Err> => {
  const { done } = createNode();

  const run = async (payload: Payload): Promise<Result> => {
    try {
      const result = await handler(payload);
      effect.settled({ status: 'fulfilled', payload, result });
      return result;
    } catch (error) {
      effect.settled({ status: 'rejected', payload, error: error as Err });
      throw error;
    }
  };

  const effect = createExecutableEvent<Payload, Promise<Result>>((payload) =>
    emitQueueMessage(run(payload)),
  ) as Effect<Payload, Result, Err>;

  effect.effect = true as const;

  effect.done = createEvent<Result>();
  effect.failed = createEvent<Err>();

  effect.fulfilled = createExecutableEvent<
    EffectFulfilledPayload<Payload, Result>,
    void
  >((payload) => effect.done(payload.result));
  effect.rejected = createExecutableEvent<
    EffectRejectedPayload<Payload, Err>,
    void
  >((payload) => effect.failed(payload.error));

  effect.settled = createExecutableEvent<
    EffectSettledPayload<Payload, Result, Err>,
    void
  >((payload) => {
    if (payload.status === 'fulfilled')
      effect.fulfilled({ payload: payload.payload, result: payload.result });
    else effect.rejected({ payload: payload.payload, error: payload.error });
  });

  done();

  return effect;
};

export const effect = createEffect;
