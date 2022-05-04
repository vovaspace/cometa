import { createContext, useContext } from 'react';

const ScopeContext = createContext(null);

export const ScopeProvider = ScopeContext.Provider;

export const useScope = () => useContext(ScopeContext);
