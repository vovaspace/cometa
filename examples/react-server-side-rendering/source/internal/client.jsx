import { context } from '@cometa/core/context';
import { ScopeProvider } from './scope';

export const ClientProvider = ({ children, scope }) => {
  context.scope = scope;
  return <ScopeProvider value={scope}>{children}</ScopeProvider>;
};
