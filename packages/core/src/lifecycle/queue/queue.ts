import { createWatcher } from '../../watcher';

export const { watch: watchQueueMessage, emit: emitQueueMessage } =
  createWatcher<Promise<unknown>>();
