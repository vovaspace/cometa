import { context } from '../context';
import { Watcher, createWatcher } from '../watcher';

export interface Node<Update = unknown> extends Watcher<Update> {
  depend: (dependency: () => void) => void;
  child: (child: Node<unknown>) => void;
  enter: () => this;
  exit: () => void;
}

export const createNode = <Update>(): Node<Update> => {
  const { watch, emit, inn, out, clear } = createWatcher<Update>();

  const dependencies = new Set<() => void>();
  const children = new Set<Node>();

  const { current: previous } = context;

  const node = {
    emit,
    inn,
    out,
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
    enter: () => {
      context.current = node;
      if (previous !== null) previous.child(node);
      return node;
    },
    exit: () => (context.current = previous),
  };

  return node;
};
