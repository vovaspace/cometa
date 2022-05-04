import type { AnyStore } from '../store';
import { createWatcher } from '../watcher';

export const created = createWatcher<AnyStore>();
