import { AnyFlow, Flow, FlowValue } from '@cometa/core';
import { compute } from '../compute';

export const some = <T extends AnyFlow>(
  sources: T[],
  predicate: (value: FlowValue<T>) => unknown,
): Flow<boolean> => compute(sources, (...values) => values.some(predicate));
