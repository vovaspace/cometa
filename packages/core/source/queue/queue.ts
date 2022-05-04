import { createWatcher, Watcher } from '../watcher';

export type Queue = Watcher;

export const createQueue: () => Queue = createWatcher;
