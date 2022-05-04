import { context } from '../context';

export const cleanup = (dependency: () => void) => {
  if (context.host !== null) context.host.depend(dependency);
  else if (process.env.NODE_ENV !== 'production')
    console.error('`cleanup()` can be used only in a flow or model context.');
};
