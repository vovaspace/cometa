import { context } from '../context';
import { Watcher, createWatcher } from '../watcher';

export interface Node<Update = unknown> extends Watcher<Update> {
  depend: (dependency: () => void) => void;
  child: (child: Node<unknown>) => void;
  done: () => void;
}

export const createNode = <Update>(): Node<Update> => {
  const { watch, emit, clear } = createWatcher<Update>();

  const dependencies = new Set<() => void>();
  const children = new Set<Node>();

  const { current: previous } = context;

  const node = {
    emit,
    watch: (watcher: (update: Update) => void) => {
      const unwatcher = watch(watcher);

      if (context.current !== null && context.current !== node)
        context.current.depend(unwatcher);

      return unwatcher;
    },
    depend: (dependency: () => void) => dependencies.add(dependency),
    child: (child: Node<unknown>) => children.add(child),
    clear: () => {
      dependencies.forEach((dependency) => dependency());
      children.forEach((child) => child.clear());

      dependencies.clear();
      children.clear();

      clear();
    },
    done: () => (context.current = previous),
  };

  context.current = node;
  previous?.child(node);

  return node;
};
