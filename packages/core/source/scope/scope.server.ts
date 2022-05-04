import { AnyEvent } from '../event';
import { context } from '../context';
import { AnyStore } from '../store';
import { Scope, ScopeKey } from './scope';
import { is } from '../is';

export const createScope = (): Scope => {
  const state = new Map<ScopeKey, (AnyStore | AnyEvent)[]>();

  const scope: Scope = {
    register: (key, units) => state.set(key, units),
    hydrate: () => {},
    dehydrate: () => {
      const result: Record<ScopeKey, unknown[]> = {};

      state.forEach(
        (units, key) =>
          (result[key] = units.map((unit) =>
            is.store(unit)
              ? { d: unit.value(), m: unit.meta }
              : { m: unit.meta },
          )),
      );

      return JSON.stringify(result);
    },
    within: (callback) => {
      const { scope: current } = context;
      context.scope = scope;
      const result = callback();
      context.scope = current;
      return result;
    },
  };

  return scope;
};
