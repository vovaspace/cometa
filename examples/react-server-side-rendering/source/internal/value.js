import { useSyncExternalStore } from 'react';

export const useValue = (source) =>
  useSyncExternalStore(source.watch, source.value, source.value);
