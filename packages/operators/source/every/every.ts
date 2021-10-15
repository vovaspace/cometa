import { AnyFlow, Flow, FlowValue } from '@cometa/core';
import { compute } from '../compute';

export const every = <T extends AnyFlow>(
  sources: T[],
  predicate: (value: FlowValue<T>) => unknown,
): Flow<boolean> => compute(sources, (...values) => values.every(predicate));
