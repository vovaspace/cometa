import { context } from '@cometa/core/context';
import { ScopeProvider } from './scope';

export const ServerProvider = ({ children, scope }) => {
  context.scope = scope;

  return <ScopeProvider value={scope}>{children}</ScopeProvider>;
};
