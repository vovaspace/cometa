import { AnyStore, StoreMeta } from '../store';
import { context } from '../context';
import { Scope, ScopeKey } from './scope';
import { AnyEvent, EventMeta } from '../event';
import { is } from '../is';

export const createScope = (): Scope => {
  const state: Record<ScopeKey, { d?: unknown; m: EventMeta | StoreMeta }[]> =
    {};
  const future: Record<ScopeKey, (AnyStore | AnyEvent)[]> = {};

  const scope: Scope = {
    register: (key, units) => {
      const values = state[key];
      if (values) {
        units.forEach((unit, index) => {
          const value = values[index]!;
          unit.meta = value.m;
          if (is.store(unit)) unit(value.d);
        });
        delete future[key];
      } else future[key] = units;
    },
    hydrate: (data) => {
      Object.assign(state, data);
      Object.entries(future).forEach(([key, units]) =>
        scope.register(key, units),
      );
    },
    dehydrate: () => '',
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
