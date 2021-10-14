import { Unit, Flow, createFlow } from '@cometa/core';

export const reflow = <T>(source: Unit<T>, initial: T): Flow<T> =>
  createFlow(
    () => initial,
    (set) => source.watch(set),
    true,
  );
