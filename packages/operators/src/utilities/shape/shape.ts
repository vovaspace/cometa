import { AnyReadableStore, ReadableStore, StoreValue, is } from '@cometa/core';

export type Shape<S extends {} = { [key: string]: unknown }> = {
  [Key in keyof S]: S[Key] | ReadableStore<S[Key]>;
};

export type ShapeValue<S extends Shape> = {
  [Key in keyof S]: S[Key] extends AnyReadableStore
    ? StoreValue<S[Key]>
    : S[Key];
};

export const createShapeUnwrapper = <S extends Shape>(
  shape: S,
): (() => ShapeValue<S>) => {
  const unwrapped = Object.entries(shape).map(([key, item]) =>
    is.store(item)
      ? ([key, item.value] as const)
      : ([key, () => item] as const),
  );

  return () =>
    unwrapped.reduce<{ [key: string]: unknown }>((acc, [key, getter]) => {
      acc[key] = getter();
      return acc;
    }, {}) as ShapeValue<S>;
};
