import { AnyUnit, Event, UnitType, createEvent } from '@cometa/core';

export const combine = <U extends AnyUnit[]>(
  ...units: U
): Event<UnitType<U[number]>> => {
  const combined = createEvent<UnitType<U[number]>>();

  units.forEach((unit) => unit.watch(combined));

  return combined;
};
