import type { AnyStore } from '../../store';
import { createWatcher } from '../../watcher';

export const { watch: watchStoreCreated, emit: emitStoreCreated } =
  createWatcher<AnyStore>();
