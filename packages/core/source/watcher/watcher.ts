export interface Watcher<Update = unknown> {
  watch: (watcher: (update: Update) => void) => () => void;
  emit: <U extends Update>(update: U) => U;
  inn: (callback: () => void) => void;
  out: (callback: () => void) => void;
  clear: () => void;
}

export const createWatcher = <Update>(): Watcher<Update> => {
  const watchers = new Set<(update: Update) => void>();
  let inn = () => {};
  let out = () => {};

  return {
    watch: (watcher: (update: Update) => void) => {
      if (watchers.size === 0) inn();
      watchers.add(watcher);

      return () => {
        watchers.delete(watcher);
        if (watchers.size === 0) out();
      };
    },
    emit: <T extends Update>(update: T): T => {
      watchers.forEach((watcher) => watcher(update));
      return update;
    },
    inn: (callback: () => void) => (inn = callback),
    out: (callback: () => void) => (out = callback),
    clear: () => watchers.clear(),
  };
};
