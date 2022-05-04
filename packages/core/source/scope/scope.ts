import { AnyStore } from '../store';
import { AnyEvent } from '../event';

export type ScopeKey = string | number;

export interface Scope {
  register: (key: ScopeKey, units: (AnyStore | AnyEvent)[]) => void;
  hydrate: (data: { [key: string]: unknown }) => void;
  dehydrate: () => string;
  within: <T>(callback: () => T) => T;
}
