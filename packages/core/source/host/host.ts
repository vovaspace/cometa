import { context } from '../context';

export interface Host {
  depend: (dependency: () => void) => void;
  child: (child: Host) => void;
  enter: () => this;
  exit: () => void;
  clear: () => void;
}

export const createHost = (): Host => {
  const dependencies = new Set<() => void>();
  const children = new Set<Host>();

  let previous: Host | null = null;

  const host = {
    depend: (dependency: () => void) => dependencies.add(dependency),
    child: (child: Host) => children.add(child),
    clear: () => {
      dependencies.forEach((dependency) => dependency());
      children.forEach((child) => child.clear());

      dependencies.clear();
      children.clear();
    },
    enter: () => {
      previous = context.host;
      context.host = host;
      if (previous !== null) previous.child(host);
      return host;
    },
    exit: () => {
      context.host = previous;
      previous = null;
    },
  };

  return host;
};
