import { AnyFlow, Flow, FlowValue, createFlow } from '@cometa/core';
import { toArray } from '../utilities';

type FlowValues<F> = {
  [I in keyof F]: FlowValue<F[I]>;
};

export interface Compute {
  <T, F extends AnyFlow>(source: F, map: (value: FlowValue<F>) => T): Flow<T>;
  <T, F extends AnyFlow[]>(
    sources: [...F],
    map: (...values: FlowValues<F>) => T,
  ): Flow<T>;
}

export const compute: Compute = <T, F extends AnyFlow | AnyFlow[]>(
  sourceOrSources: F,
  map: F extends AnyFlow
    ? (value: FlowValue<F>) => T
    : (...values: FlowValues<F> extends unknown[] ? FlowValues<F> : never) => T,
): Flow<T> => {
  const sources = toArray(sourceOrSources);

  const origins = new Set<AnyFlow>();
  for (let i = 0; i < sources.length; i += 1) {
    const flow = sources[i]!;
    if (flow.meta.origins)
      (flow.meta.origins as Set<AnyFlow>).forEach((origin) =>
        origins.add(origin),
      );
    else origins.add(flow);
  }

  // @ts-expect-error: A spread argument must either have a tuple type or be passed to a rest parameter.
  const value = () => map(...sources.map((flow) => flow.value()));

  const computed = createFlow<T>(value, (set) =>
    origins.forEach((origin) => origin.watch(() => set(value()))),
  );

  computed.meta.origins = origins;

  return computed;
};
