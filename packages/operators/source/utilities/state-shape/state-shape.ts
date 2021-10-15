import { Flow, FlowValue, AnyFlow, is } from '@cometa/core';

export type StateShape<Shape> = {
  [Key in keyof Shape]: Flow<Shape[Key]> | Shape[Key];
};

export type StateShapeValue<SS> = {
  [Key in keyof SS]: SS[Key] extends AnyFlow ? FlowValue<SS[Key]> : SS[Key];
};

export type AnyStateShape = StateShape<any>;

const convert = (
  item: unknown,
  key: string | number | symbol,
): [string | number | symbol, () => unknown] =>
  is.flow(item) ? [key, item.value] : [key, () => item];

export const createStateShapeUnwrapper = <S>(
  shape: S,
): (() => StateShapeValue<S>) => {
  const isArray = Array.isArray(shape);

  const unwrapped = isArray
    ? shape.map(convert)
    : Object.entries(shape).map(([key, item]) => convert(item, key));

  return () => {
    const value = isArray ? [] : {};

    for (let i = 0; i < unwrapped.length; i += 1) {
      const [key, getter] = unwrapped[i]!;
      // @ts-expect-error: Expression of type 'string | number | symbol' can't be used to index type '{}'
      value[key] = getter();
    }

    return value as StateShapeValue<S>;
  };
};
