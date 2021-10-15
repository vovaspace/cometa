import type { UnknownModel } from '../../model';
import { createWatcher } from '../../watcher';

export const { watch: watchModelCreated, emit: emitModelCreated } =
  createWatcher<UnknownModel>();
