import type { AnyEvent } from '../event';
import { createWatcher } from '../watcher';

export const created = createWatcher<AnyEvent>();
