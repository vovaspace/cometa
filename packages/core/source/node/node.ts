import { context } from '../context';
import { Watcher, createWatcher } from '../watcher';

export type Node<Update = unknown> = Watcher<Update>;

export const createNode = <Update>(): Node<Update> => {
  const { watch, emit, inn, out, clear } = createWatcher<Update>();

  return {
    emit,
    inn,
    out,
    clear,
    watch: (watcher: (update: Update) => void) => {
      const unwatcher = watch(watcher);

      if (context.host !== null) context.host.depend(unwatcher);

      return unwatcher;
    },
  };
};
