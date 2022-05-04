import { context } from '../context';
import {
  Event,
  ExoticExecutableEvent,
  createEvent,
  createExoticExecutableEvent,
} from '../event';

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
  extends ExoticExecutableEvent<Payload, Promise<Result>> {
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
  const run = async (payload: Payload): Promise<Result> => {
    const { queue } = context;
    try {
      const result = await handler(payload);
      context.queue = queue;
      effect.settled({ status: 'fulfilled', payload, result });
      return result;
    } catch (error) {
      context.queue = queue;
      effect.settled({ status: 'rejected', payload, error: error as Err });
      throw error;
    }
  };

  const effect = createExoticExecutableEvent<Payload, Promise<Result>>(
    (payload) =>
      context.queue === null ? run(payload) : context.queue.emit(run(payload)),
  ) as Effect<Payload, Result, Err>;

  effect.effect = true as const;

  effect.done = createEvent<Result>();
  effect.failed = createEvent<Err>();

  effect.fulfilled = createExoticExecutableEvent<
    EffectFulfilledPayload<Payload, Result>,
    void
  >((payload) => effect.done(payload.result));
  effect.rejected = createExoticExecutableEvent<
    EffectRejectedPayload<Payload, Err>,
    void
  >((payload) => effect.failed(payload.error));

  effect.settled = createExoticExecutableEvent<
    EffectSettledPayload<Payload, Result, Err>,
    void
  >((payload) => {
    if (payload.status === 'fulfilled')
      effect.fulfilled({ payload: payload.payload, result: payload.result });
    else effect.rejected({ payload: payload.payload, error: payload.error });
  });

  return effect;
};

export const effect = createEffect;
