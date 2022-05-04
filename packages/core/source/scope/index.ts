import { Scope } from './scope';

export * from './scope';

export const { createScope }: { createScope: () => Scope } =
  typeof window === 'undefined'
    ? // eslint-disable-next-line global-require
      require('./scope.server')
    : // eslint-disable-next-line global-require
      require('./scope.client');
