import { context } from '../context';

export const cleanup = (dependency: () => void) => {
  if (process.env.NODE_ENV !== 'production' && context.current === null)
    console.error('`cleanup()` can be used only in a model context.');

  context.current?.depend(dependency);
};
