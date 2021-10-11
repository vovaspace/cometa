export interface Watcher<Update = unknown> {
  watch: (watcher: (update: Update) => void) => () => void;
  emit: <U extends Update>(update: U) => U;
  clear: () => void;
}

export const createWatcher = <Update>(): Watcher<Update> => {
  const watchers = new Set<(update: Update) => void>();

  return {
    watch: (watcher: (update: Update) => void) => {
      watchers.add(watcher);
      return () => watchers.delete(watcher);
    },
    emit: <T extends Update>(update: T): T => {
      watchers.forEach((watcher) => watcher(update));
      return update;
    },
    clear: () => watchers.clear(),
  };
};
