import { Watcher } from '../watcher';

export interface Unit<T> extends Omit<Watcher<T>, 'emit'> {
  (update: T): void;
  cometa: true;
}

export type AnyUnit = Unit<any>;
