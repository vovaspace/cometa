import { context } from '../context';

export const cleanup = (dependency: () => void) => {
  if (context.current !== null) context.current.depend(dependency);
  else if (process.env.NODE_ENV !== 'production')
    console.error('`cleanup()` can be used only in a flow or model context.');
};
