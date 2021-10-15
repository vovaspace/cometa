import type { AnyFlow } from '../../flow';
import { createWatcher } from '../../watcher';

export const { watch: watchFlowCreated, emit: emitFlowCreated } =
  createWatcher<AnyFlow>();
