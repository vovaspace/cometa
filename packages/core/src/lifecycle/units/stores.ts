import type { AnyReadableStore, AnyWritableStore } from '../../store';
import { createWatcher } from '../../watcher';
import { emitUnitCreated } from './units';

export const { watch: watchStoreCreated, emit: emitStoreCreated } =
  createWatcher<AnyReadableStore & AnyWritableStore>();

watchStoreCreated(emitUnitCreated);
