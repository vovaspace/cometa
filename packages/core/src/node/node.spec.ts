import { context } from '../context';
import { createNode } from './node';

describe('node', () => {
  beforeAll(() => {
    context.current = null;
  });

  afterEach(() => {
    context.current = null;
  });

  it('sets context', () => {
    const node = createNode();
    node.enter();
    expect(context.current).toBe(node);
  });

  it('sets previous context', () => {
    const first = createNode().enter();
    expect(context.current).toBe(first);

    const second = createNode().enter();
    expect(context.current).toBe(second);

    second.exit();
    expect(context.current).toBe(first);

    first.exit();
    expect(context.current).toBeNull();
  });

  it('watches', () => {
    const node = createNode();
    const watcher = jest.fn();
    node.watch(watcher);

    node.emit(null);

    expect(watcher).toHaveBeenCalledWith(null);
  });

  it('clears children', () => {
    const first = createNode().enter();
    const second = createNode().enter();

    second.exit();
    first.exit();

    const watcher = jest.fn();
    second.watch(watcher);
    first.clear();
    second.emit(null);

    expect(watcher).not.toHaveBeenCalled();
  });

  it('depends a current node', () => {
    const first = createNode().enter();
    const second = createNode().enter();

    const watcher = jest.fn();
    first.watch(watcher);

    second.exit();
    first.exit();

    second.clear();
    first.emit(null);

    expect(watcher).not.toHaveBeenCalled();
  });
});
