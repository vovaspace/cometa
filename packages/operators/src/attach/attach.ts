import {
  AnyEffect,
  AnyEvent,
  AnyFlow,
  createEffect,
  createEvent,
  Effect,
  EffectError,
  EffectResult,
  Event,
  EventPayload,
  Flow,
  FlowValue,
  is,
} from '@cometa/core';
import {
  AnyStateShape,
  createStateShapeUnwrapper,
  StateShape,
  StateShapeValue,
} from '../utilities';

type SourceValue<S> = S extends AnyFlow
  ? FlowValue<S>
  : S extends AnyStateShape
  ? StateShapeValue<S>
  : never;

export function attach<
  E extends AnyEvent,
  Source extends Flow<EventPayload<E>> | StateShape<EventPayload<E>>,
  Payload = void,
>(
  target: E,
  source: Source,
  map?: (source: SourceValue<Source>, payload: Payload) => EventPayload<E>,
): E extends AnyEffect
  ? Effect<Payload, EffectResult<E>, EffectError<E>>
  : Event<Payload>;

export function attach<
  E extends AnyEvent,
  Source extends AnyFlow | AnyStateShape,
  Payload = void,
>(
  target: E,
  source: Source,
  map: (source: SourceValue<Source>, payload: Payload) => EventPayload<E>,
): E extends AnyEffect
  ? Effect<Payload, EffectResult<E>, EffectError<E>>
  : Event<Payload>;

export function attach<
  E extends AnyEvent,
  Source extends AnyFlow | AnyStateShape,
  Payload = void,
>(
  target: E,
  source: Source,
  map?: (source: unknown, payload: unknown) => EventPayload<E>,
): Effect<Payload, EffectResult<E>, EffectError<E>> | Event<Payload> {
  const value = is.flow(source)
    ? source.value
    : createStateShapeUnwrapper(source);

  const run: (payload: unknown) => any = map
    ? (payload: unknown) => target(map(value(), payload))
    : () => target(value());

  if (is.effect(target))
    return createEffect<Payload, EffectResult<E>, EffectError<E>>(run);

  const derived = createEvent<Payload>();
  derived.watch(run);
  return derived;
}
