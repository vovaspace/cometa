import type { Host } from '../host';
import type { Queue } from '../queue';
import type { Scope } from '../scope';

export interface Context {
  host: Host | null;
  queue: Queue | null;
  scope: Scope | null;
}

export const context: Context = {
  host: null,
  queue: null,
  scope: null,
};
