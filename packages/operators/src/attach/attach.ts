import {
  AnyEffect,
  AnyReadableStore,
  Effect,
  EffectError,
  EffectPayload,
  EffectResult,
  ReadableStore,
  StoreValue,
  createEffect,
  is,
} from '@cometa/core';
import { Shape, ShapeValue, createShapeUnwrapper } from '../utilities';

type StoreOrShapeValue<S> = S extends AnyReadableStore
  ? StoreValue<S>
  : S extends Shape
  ? ShapeValue<S>
  : never;

export function attach<
  Fx extends AnyEffect,
  Source extends ReadableStore<EffectPayload<Fx>> | Shape<EffectPayload<Fx>>,
  Payload = void,
>(
  effect: Fx,
  source: Source,
  map?: (
    source: StoreOrShapeValue<Source>,
    payload: Payload,
  ) => EffectPayload<Fx>,
): Effect<Payload, EffectResult<Fx>, EffectError<Fx>>;

export function attach<
  Fx extends AnyEffect,
  Source extends AnyReadableStore | Shape,
  Payload = void,
>(
  effect: Fx,
  source: Source,
  map: (
    source: StoreOrShapeValue<Source>,
    payload: Payload,
  ) => EffectPayload<Fx>,
): Effect<Payload, EffectResult<Fx>, EffectError<Fx>>;

export function attach<
  Fx extends AnyEffect,
  Source extends AnyReadableStore | Shape,
  Payload = void,
>(
  effect: Fx,
  source: Source,
  map?: (source: unknown, payload: unknown) => EffectPayload<Fx>,
) {
  const value = is.store(source) ? source.value : createShapeUnwrapper(source);
  const run = map
    ? (payload: unknown) => effect(map(value(), payload))
    : () => effect(value());

  return createEffect<Payload, EffectResult<Fx>, EffectError<Fx>>(run);
}
